@echo off
title Ped Aerial Backend
color 0A
set "JAVA_HOME=C:\Program Files\Microsoft\jdk-21.0.10.7-hotspot"
set "PATH=%JAVA_HOME%\bin;C:\Users\apache-maven-3.9.14\bin;%PATH%"
cd /d C:\Users\phillip.dowdy\repos\operator_flight_check\operator-flight-check\backend
echo Starting Spring Boot...
mvn spring-boot:run "-Dspring-boot.run.profiles=demo" "-Dspring-boot.run.arguments=--server.port=8081 --spring.datasource.url=jdbc:mysql://localhost:3306/operator_flight_check_demo?createDatabaseIfNotExist=true"
pause
