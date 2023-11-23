import {Injectable} from '@nestjs/common';
import {Task, TaskState} from "@tasks/client";
import {filters, NotificationFilter} from "./filters";

export const shouldNotify = (task: Task, filters: NotificationFilter[]) => {
  for (const filter of filters) {
    let match = true
    for (const key in filter) {
      if (filter[key] instanceof Object) {
        // Check for gte operator
        if (filter[key].gte !== undefined && task[key] < filter[key].gte) {
          match = false
          break
        }

        // Check for in operator
        if (filter[key].in !== undefined && !filter[key].in.includes(task[key])) {
          match = false
          break
        }
      } else {
        if (filter[key] !== task[key]) {
          match = false
          break
        }
      }
    }
    if (match) return true
  }
  return false
}

@Injectable()
export class NotificationsService {
  constructor(
  ) {
  }

  async handleError(task: Task): Promise<void> {
    try {
      if (task.state === TaskState.ERROR) {
        if (shouldNotify(task, filters)) {
          // notify
        }
      }
    } catch (e) {
      console.error(`Failed to send notification for task ${task.id}`, e)
    }
  }
}
