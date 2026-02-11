param(
  [Parameter(Mandatory = $true)]
  [string]$DockerUser,

  [string]$ImageName = "entry-share-pal",
  [string]$Tag = "latest"
)

$ErrorActionPreference = "Stop"

function Require-Command {
  param([string]$Name)
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "'$Name' is not installed. Install Docker Desktop/CLI first."
  }
}

Write-Host "Checking Docker CLI..." -ForegroundColor Cyan
Require-Command "docker"

$localImage = "${ImageName}:${Tag}"
$remoteImage = "${DockerUser}/${ImageName}:${Tag}"

Write-Host "Building ${localImage}..." -ForegroundColor Cyan
docker build -t $localImage .

Write-Host "Logging in to Docker registry..." -ForegroundColor Cyan
docker login

Write-Host "Tagging ${remoteImage}..." -ForegroundColor Cyan
docker tag $localImage $remoteImage

Write-Host "Pushing ${remoteImage}..." -ForegroundColor Cyan
docker push $remoteImage

Write-Host "Done. Published ${remoteImage}" -ForegroundColor Green
