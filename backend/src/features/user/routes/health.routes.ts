import HTTP_STATUS from 'http-status-codes';
import { Request, Response, Router } from 'express';
import moment from 'moment';
import { config } from '~/config';
import axios, { AxiosResponse } from 'axios';
import { performance } from 'perf_hooks';

class HealthRoutes {
  private router: Router;

  constructor() {
    this.router = Router();
  }
  // TODO: remove at the end later
  public health(): Router {
    this.router.get('/health', (req: Request, res: Response) => {
      res.status(HTTP_STATUS.OK).send(`Health: Server instance is healthy with id ${process.pid} on ${moment().format('LL')}. test CodeDeploy`);
    });
    return this.router;
  }

  public env(): Router {
    this.router.get('/env', (req: Request, res: Response) => {
      res.status(HTTP_STATUS.OK).send(`This is the ${config.NODE_ENV} environment.`);
    });
    return this.router;
  }

  public instance(): Router {
    this.router.get('/instance', async (req: Request, res: Response) => {
      const response: AxiosResponse = await axios({
        method: 'get',
        url: config.EC2_URL
      });
      res
        .status(HTTP_STATUS.OK)
        .send(`Server is running on EC2 instance with id ${response.data} and process id ${process.pid} on ${moment().format('LL')}`);
    });
    return this.router;
  }

  public fiboRoute(): Router {
    this.router.get('/fibo/:num', async (req: Request, res: Response) => {
      const { num } = req.params;
      const start: number = performance.now();
      const result = this.fibo(parseInt(num, 10));
      const end: number = performance.now();

      const response: AxiosResponse = await axios({
        method: 'get',
        url: config.EC2_URL
      });

      res.status(HTTP_STATUS.OK).send(
        // `Fibonacci series of ${num} is ${result} and it took ${end - start}ms with EC2 instance of ${response.data} and process id ${
        //   process.pid
        `Fibonacci series of ${num} is ${result} and it took ${end - start}ms with EC2 instance of ${response.data} an process id ${
          process.pid
        } on ${moment().format('LL')}`
      );
    });
    return this.router;
  }

  private fibo(data: number): number {
    if (data < 2) return 1;
    else return this.fibo(data - 2) + this.fibo(data - 1);
  }
}

export const healthRoutes: HealthRoutes = new HealthRoutes();
