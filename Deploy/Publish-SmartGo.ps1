. $PSScriptRoot\Account.ps1

$webSiteName = "SmartGo"
$projectFilePath = "$PSScriptRoot\..\Source\Hitcher\hitcher.csproj"

& $PSScriptRoot\Publish-WebApplication.ps1 -WebSiteName $webSiteName -ProjectFile $projectFilePath