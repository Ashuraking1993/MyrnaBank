using Whisper.net;
using Whisper.net.Ggml;

namespace KwentadorPH.Api.Services;

public class LocalWhisperService
{
    private readonly string _modelPath;

    public LocalWhisperService()
    {
        var modelsFolder = Path.Combine(
            AppContext.BaseDirectory,
            "Models"
        );

        Directory.CreateDirectory(modelsFolder);

        _modelPath = Path.Combine(
            modelsFolder,
            "ggml-base.bin"
        );
    }

    public async Task EnsureModelAsync()
    {
        if (File.Exists(_modelPath))
            return;

        using var modelStream =
            await WhisperGgmlDownloader.Default.GetGgmlModelAsync(
                GgmlType.Base
            );

        using var fileWriter =
            File.OpenWrite(_modelPath);

        await modelStream.CopyToAsync(fileWriter);
    }

    public async Task<string> TranscribeAsync(Stream audioStream)
    {
        await EnsureModelAsync();

        using var factory =
            WhisperFactory.FromPath(_modelPath);

        var processor =
        factory.CreateBuilder()
            .WithLanguage("en")
            .WithPrompt(
                "Filipino Taglish expense entry. " +
                "Common words: fare, pamasahe, jeep, tricycle, bus, Grab, " +
                "gulay, palengke, grocery, lunch, dinner, gas, parking, pesos."
            )
        .Build();

        var transcript = new List<string>();

        await foreach (
            var segment in processor.ProcessAsync(audioStream)
        )
        {
            transcript.Add(segment.Text);
        }

        return string.Join(" ", transcript).Trim();
    }
}