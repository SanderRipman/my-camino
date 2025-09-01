@{
    RootModule        = 'AidMe.Helpers.psm1'
    ModuleVersion     = '1.0.0'
    GUID              = 'a416f931-1785-4707-91ea-584afcbdc3fc'
    Author            = 'AidMe'
    Description       = 'Hjelpere for utviklingsflyt (dev→main), snapshots og meny'
    PowerShellVersion = '7.0'
    FunctionsToExport = @('Open-Repo','New-Feature','Release','HealthCheck','Check-Handover','New-AidMeHandover','Start-AidMeMenu','Invoke-AutoPush','New-Favicons')
    PrivateData       = @{}
}
