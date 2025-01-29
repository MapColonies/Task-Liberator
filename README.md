# Map Colonies Task Liberator

----------------------------------
![badge-alerts-lgtm](https://img.shields.io/lgtm/alerts/github/MapColonies/Task-Liberator?style=for-the-badge)
![grade-badge-lgtm](https://img.shields.io/lgtm/grade/javascript/github/MapColonies/Task-Liberator?style=for-the-badge)
![snyk](https://img.shields.io/snyk/vulnerabilities/github/MapColonies/Task-Liberator?style=for-the-badge)
----------------------------------

## Overview

This service operates as a cron job to manage task states in job management service. It updates "IN-PROGRESS" tasks to "PENDING" state and increases their attempt count, allowing them to be retried by the relevant task worker. This occurs when a task exceeds the configured expiration time or its heartbeat has stopped.

## Architecture

The service consists of the following main components:

- **UpdateTimeReleaser**: Releases tasks based on their last update time.
- **ExpirationStatusUpdater**: Updates the status of expired tasks.
- **TasksClient**: Communicates with the job management service to manage tasks.
- **HeartbeatClient**: Communicates with the heartbeat service to check task heartbeats.

## Task Release Conditions

### Release Based on Heartbeat
Releases tasks for which the worker did not send a heartbeat for longer than the configured `HEARTBEAT_FAILED_DURATION` seconds.
- Can be toggled with the `HEARTBEAT_ENABLED` configuration.
- Requires an active heartbeat logging service at `HEARTBEAT_SERVICE_URL`.

### Release Based on Last Update Time
Releases tasks that were not updated for longer than the configured `UPDATE_TIME_FAILED_DURATION` seconds.
- Can be toggled with the `UPDATE_TIME_ENABLED` configuration.

## Configuration

The service can be configured using the following parameters:

- `updateTime.enabled`: Enables or disables the update time releaser.
- `updateTime.checkHeartbeat`: Enables or disables the heartbeat check for tasks.
- `updateTime.failedDurationSec`: The duration in seconds after which a task is considered inactive based on its last update time.
- `updateTime.taskTypes`: The types of tasks to be considered for release based on update time.
- `updateTime.ignoredTaskTypes`: The types of tasks to be ignored for release based on update time.
- `heartbeat.failedDurationMS`: The duration in milliseconds after which a task is considered inactive based on its heartbeat.
- `heartbeat.serviceUrl`: The URL of the heartbeat logging service.

## Usage

To run the service, ensure that the necessary configurations are set and execute the cron job. The service will log its actions and provide information on the tasks it processes.
