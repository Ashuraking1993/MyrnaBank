using FFMpegCore;

namespace KwentadorPH.Api.Services;

public class AudioConversionService
{
    public async Task<string> ConvertToWavAsync(
        IFormFile audio)
    {
        var tempFolder = Path.Combine(
            Path.GetTempPath(),
            "KwentadorPH"
        );

        Directory.CreateDirectory(tempFolder);

        var inputPath = Path.Combine(
            tempFolder,
            $"{Guid.NewGuid()}.m4a"
        );

        var outputPath = Path.Combine(
            tempFolder,
            $"{Guid.NewGuid()}.wav"
        );

        await using (var stream =
            File.Create(inputPath))
        {
            await audio.CopyToAsync(stream);
        }

        await FFMpegArguments
            .FromFileInput(inputPath)
            .OutputToFile(
                outputPath,
                true,
                options => options
                    .WithAudioCodec("pcm_s16le")
                    .WithAudioSamplingRate(16000)
                    .WithCustomArgument("-ac 1")
            )
            .ProcessAsynchronously();

        File.Delete(inputPath);

        return outputPath;
    }
}