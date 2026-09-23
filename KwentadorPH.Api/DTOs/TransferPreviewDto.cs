namespace KwentadorPH.Api.DTOs;

public class TransferPreviewDto : CreateTransferDto
{
    // Demo/testing signals until real device and identity
    // infrastructure is connected.
    public bool IsNewDevice { get; set; }

    public bool HasIdentityMismatch { get; set; }
}