. $PSScriptRoot\Account.ps1

$webSiteName = "CustomerMan86"
$projectFilePath = "$PSScriptRoot\..\CustomerManager\CustomerManager.csproj"

& $PSScriptRoot\Publish-WebApplication.ps1 -WebSiteName $webSiteName -ProjectFile $projectFilePath