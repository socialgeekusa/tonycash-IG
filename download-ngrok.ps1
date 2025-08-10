# Download and extract ngrok
$url = "https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-windows-amd64.zip"
$zipFile = "ngrok.zip"
$extractPath = "."

Write-Host "Downloading ngrok..."
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
Invoke-WebRequest -Uri $url -OutFile $zipFile -UseBasicParsing

if (Test-Path $zipFile) {
    Write-Host "Extracting ngrok..."
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    [System.IO.Compression.ZipFile]::ExtractToDirectory($zipFile, $extractPath)
    
    Write-Host "Cleaning up..."
    Remove-Item $zipFile
    
    if (Test-Path "ngrok.exe") {
        Write-Host "ngrok.exe successfully installed!"
    } else {
        Write-Host "Error: ngrok.exe not found after extraction"
    }
} else {
    Write-Host "Error: Failed to download ngrok"
}
