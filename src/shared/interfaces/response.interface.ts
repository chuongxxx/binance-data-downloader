import { EResponseStatus } from "@shared/enums/response.enum";

export interface IErrorResponse {
  code: number;
  message: string;
}

export class ServerResponse<T> {
  status: EResponseStatus;
  data?: T;
  error?: IErrorResponse;

  constructor(status: EResponseStatus, data?: T, error?: IErrorResponse) {
    this.status = status;
    this.data = data;
    this.error = error;
  }
}
