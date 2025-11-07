@ECHO OFF
SETLOCAL
SET BASEDIR=%~dp0
SET WRAPPER_JAR=%BASEDIR%\.mvn\wrapper\maven-wrapper.jar
SET PROPS=%BASEDIR%\.mvn\wrapper\maven-wrapper.properties

IF NOT EXIST "%WRAPPER_JAR%" (
  FOR /F "usebackq tokens=2 delims==" %%A IN ("%PROPS%") DO (
    IF NOT DEFINED WRAPURL SET WRAPURL=%%A
  )
  IF NOT DEFINED WRAPURL SET WRAPURL=https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar
  IF NOT EXIST "%BASEDIR%\.mvn\wrapper" MKDIR "%BASEDIR%\.mvn\wrapper"
  ECHO Downloading Maven Wrapper: %WRAPURL%
  powershell -Command "Invoke-WebRequest -Uri '%WRAPURL%' -OutFile '%WRAPPER_JAR%'" 2> NUL
)

SET JAVA_EXE=%JAVA_HOME%\bin\java.exe
IF NOT EXIST "%JAVA_EXE%" SET JAVA_EXE=java
"%JAVA_EXE%" -classpath "%WRAPPER_JAR%" org.apache.maven.wrapper.MavenWrapperMain %*

