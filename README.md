# Map Colonies Task Liberator

----------------------------------
![badge-alerts-lgtm](https://img.shields.io/lgtm/alerts/github/MapColonies/Task-Liberator?style=for-the-badge)
![grade-badge-lgtm](https://img.shields.io/lgtm/grade/javascript/github/MapColonies/Task-Liberator?style=for-the-badge)
![snyk](https://img.shields.io/snyk/vulnerabilities/github/MapColonies/Task-Liberator?style=for-the-badge)
----------------------------------

this is a job that when run updates "in-progress" tasks in the job management service to "pending" and increase their attempt count, so the can be retried by the relevant task worker.


### task release conditions
- release base on heartbeat: releases tasks for whom the worker did not sent heartbeat for longer the the configured ```HEARTBEAT_FAILED_DURATION``` second
  - can be toggled with the ```HEARTBEAT_ENABLED``` configuration
  - required active heartbeat logging service at ```HEARTBEAT_SERVICE_URL```
- release base on last update time: releases tasks that was not updated for longer the the configured ```UPDATE_TIME_FAILED_DURATION``` second
  - can be toggled with the ```UPDATE_TIME_ENABLED``` configuration

