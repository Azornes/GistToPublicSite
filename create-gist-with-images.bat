@echo off
setlocal enabledelayedexpansion

:: ============================================
:: Create Gist with Base64 Image Conversion
:: ============================================
:: Usage: create-gist-with-images.bat [folder_path] [optional_description]

if "%~1"=="" (
    echo Error: Please provide a folder path
    echo.
    echo Usage: create-gist-with-images.bat [folder_path] [optional_description]
    echo Example: create-gist-with-images.bat "C:\MyProject" "My awesome project"
    exit /b 1
)

set "SOURCE_FOLDER=%~1"
set "GIST_DESC=%~2"
set "TEMP_FOLDER=%TEMP%\gist-temp-%RANDOM%"

:: Check if folder exists
if not exist "%SOURCE_FOLDER%" (
    echo Error: Folder does not exist: %SOURCE_FOLDER%
    exit /b 1
)

echo.
echo ================================================
echo Creating Gist from folder: %SOURCE_FOLDER%
echo ================================================
echo.

:: Create temporary folder
mkdir "%TEMP_FOLDER%" 2>nul

:: Process all files
echo Scanning files...
echo.

set "FILE_COUNT=0"
set "IMAGE_COUNT=0"

for /r "%SOURCE_FOLDER%" %%F in (*) do (
    set "ext=%%~xF"
    set "filename=%%~nxF"
    set "fullpath=%%F"
    
    :: Get relative path by removing SOURCE_FOLDER prefix
    set "relpath=!fullpath:%CD%\%SOURCE_FOLDER%\=!"
    
    :: Create output path (flatten structure - replace \ and spaces with _)
    set "outpath=!relpath!"
    set "outpath=!outpath:\=_!"
    set "outpath=!outpath: =_!"
    
    :: Check if it's an image file
    set "is_image=0"
    if /i "!ext!"==".png" set "is_image=1"
    if /i "!ext!"==".jpg" set "is_image=1"
    if /i "!ext!"==".jpeg" set "is_image=1"
    if /i "!ext!"==".gif" set "is_image=1"
    
    if "!is_image!"=="1" (
        echo [IMAGE] Converting: !relpath!
        powershell -NoProfile -ExecutionPolicy Bypass -Command "$bytes = [IO.File]::ReadAllBytes('%%F'); $base64 = [Convert]::ToBase64String($bytes); $output = 'data:image/!ext:~1!;base64,' + $base64; [IO.File]::WriteAllText('%TEMP_FOLDER%\!outpath!.base64.txt', $output, [System.Text.Encoding]::UTF8)"
        set /a IMAGE_COUNT+=1
    ) else (
        echo [FILE] Copying: !relpath!
        copy "%%F" "%TEMP_FOLDER%\!outpath!" >nul 2>&1
    )
    
    set /a FILE_COUNT+=1
)

echo.
echo ================================================
echo Processed: !FILE_COUNT! files (!IMAGE_COUNT! images converted to Base64)
echo ================================================
echo.

:: Build gh gist create command
echo Creating gist...
cd /d "%TEMP_FOLDER%"

:: Execute gh gist create
echo.
echo Executing: gh gist create with !FILE_COUNT! files...
echo.

if not "%GIST_DESC%"=="" (
    gh gist create -d "%GIST_DESC%" *
) else (
    gh gist create *
)

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ================================================
    echo SUCCESS! Gist created successfully!
    echo ================================================
) else (
    echo.
    echo ================================================
    echo ERROR: Failed to create gist
    echo ================================================
)

:: Cleanup
cd /d "%~dp0"
rmdir /s /q "%TEMP_FOLDER%" 2>nul

echo.
echo Temporary files cleaned up.
echo Done!
echo.

endlocal
