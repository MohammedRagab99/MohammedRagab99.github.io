[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [string]$WorkbookPath
)

$ErrorActionPreference = 'Stop'
$file = Get-Item -LiteralPath $WorkbookPath
if ($file.PSIsContainer -or $file.Extension -ne '.xlsx') {
    throw 'Pass the local OneDrive-synced .xlsx daily activities workbook or a test copy.'
}

$sheetName = 'Daily Progress'
$tableName = 'RagabVerseDaily'
$headers = @(
    'Entry ID', 'Date', 'Unit', 'Equipment tag', 'Work order', 'EPTW',
    'Activity', 'Status', 'Progress', 'Hours', 'Remarks'
)

$excel = New-Object -ComObject Excel.Application
$workbook = $null
try {
    $excel.DisplayAlerts = $false
    $excel.AutomationSecurity = 3
    $workbook = $excel.Workbooks.Open($file.FullName, 0, $false)
    if ($workbook.ReadOnly) {
        throw 'Excel opened the workbook read-only. Close other editors and verify OneDrive edit access.'
    }

    $outputSheet = $null
    foreach ($sheet in $workbook.Worksheets) {
        foreach ($table in $sheet.ListObjects) {
            if ($table.Name -eq $tableName) {
                $actualHeaders = @($table.ListColumns | ForEach-Object { $_.Name })
                if (($actualHeaders -join "`t") -cne ($headers -join "`t")) {
                    throw "The existing $tableName table has different headers. Review it with the workbook owner."
                }
                Write-Host "$tableName already has the required headers."
                return
            }
        }
        if ($sheet.Name -eq $sheetName) {
            $outputSheet = $sheet
        }
    }

    if ($null -ne $outputSheet) {
        throw "A '$sheetName' sheet already exists. Review it with the workbook owner before creating a table."
    }

    $outputSheet = $workbook.Worksheets.Add()
    $outputSheet.Name = $sheetName
    for ($column = 1; $column -le $headers.Count; $column++) {
        $outputSheet.Cells.Item(1, $column).Value2 = $headers[$column - 1]
    }

    # xlSrcRange = 1 and xlYes = 1.
    $table = $outputSheet.ListObjects.Add(1, $outputSheet.Range('A1:K2'), [Type]::Missing, 1)
    $table.Name = $tableName
    foreach ($range in @('A:H', 'K:K')) {
        $outputSheet.Range($range).NumberFormat = '@'
    }
    $outputSheet.Range('A:K').EntireColumn.AutoFit() | Out-Null
    $workbook.Save()
    Write-Host "Saved $tableName. Wait for OneDrive to sync before testing Microsoft Graph."
} finally {
    try {
        if ($null -ne $workbook) {
            $workbook.Close($false)
        }
    } finally {
        $excel.Quit()
    }
}
