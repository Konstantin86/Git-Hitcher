
[CmdletBinding(PositionalBinding=$True)]

Param(
        [parameter(Mandatory=$True)]
        [String] $Name
    )

#Removing web site
if(Test-AzureName -Website $Name) {
    Remove-AzureWebsite -Name $Name
}

#Remove storage
$storageAccountName = $Name.ToLower() + "storage"
if(Test-AzureName -Storage $storageAccountName) {
    Remove-AzureStorageAccount -StorageAccountName $storageAccountName
}