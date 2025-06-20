# Print-BackendSrcFiles.ps1
# This script exports the contents of all files in the backend/src directory to a Markdown file

param (
    [string]$basePath = "d:\Projects\Desktop\content-management",
    [string]$outputFile = "BackendSourceCode.md"
)

$srcPath = Join-Path -Path $basePath -ChildPath "backend\src"

# Check if the path exists
if (-not (Test-Path $srcPath)) {
    Write-Error "The path $srcPath does not exist."
    exit 1
}

# Get all files recursively
$files = Get-ChildItem -Path $srcPath -Recurse -File

# Output some stats to console
Write-Host "Found $($files.Count) files in $srcPath" -ForegroundColor Yellow
Write-Host "Exporting to $outputFile..." -ForegroundColor Cyan

# Create the Markdown file with a header
$outputPath = Join-Path -Path $basePath -ChildPath $outputFile
$date = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

@"
# Backend Source Code Documentation
> Generated on $date

This document contains the source code from \`$srcPath\`.

## Table of Contents
"@ | Out-File -FilePath $outputPath -Encoding utf8

# Generate Table of Contents
$tocItems = @()
$fileIndex = 1
foreach ($file in $files) {
    $relativePath = $file.FullName.Replace($srcPath, "").TrimStart("\")
    $tocItems += "- [$fileIndex. $relativePath](#file-$fileIndex)"
    $fileIndex++
}

$tocItems | Out-File -FilePath $outputPath -Encoding utf8 -Append

# Loop through each file and append its content to the Markdown file
$fileIndex = 1
foreach ($file in $files) {
    $relativePath = $file.FullName.Replace($srcPath, "").TrimStart("\")
    $fileSize = [math]::Round($file.Length / 1KB, 2)
    $lastModified = $file.LastWriteTime
    
    # Determine file extension for syntax highlighting
    $extension = $file.Extension.TrimStart('.')
    if ($extension -eq 'ts') { $language = 'typescript' }
    elseif ($extension -eq 'js') { $language = 'javascript' }
    elseif ($extension -eq 'json') { $language = 'json' }
    elseif ($extension -eq 'md') { $language = 'markdown' }
    else { $language = $extension }
    
    # Write file header and metadata
    @"

<a id="file-$fileIndex"></a>
## $fileIndex. $relativePath

**File Size:** $fileSize KB | **Last Modified:** $lastModified

\`\`\`$language
"@ | Out-File -FilePath $outputPath -Encoding utf8 -Append
    
    # Write file content
    Get-Content -Path $file.FullName | Out-File -FilePath $outputPath -Encoding utf8 -Append
    
    # Close code block
    '```' | Out-File -FilePath $outputPath -Encoding utf8 -Append
    
    $fileIndex++
}

Write-Host "Export complete! Saved to $outputPath" -ForegroundColor Green
Write-Host "Total files exported: $($files.Count)" -ForegroundColor Yellow