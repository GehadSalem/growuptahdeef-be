import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: err.message || 'حدث خطأ في الخادم' 
  });
};
type AsyncFunction = (req: Request, res: Response, next: NextFunction) => Promise<any>;

export const asyncHandler = (fn: AsyncFunction) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

export const globalErrorHandling = (
  err: Error & { cause?: number },
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err.cause || 500;
  const response: any = {
    message: err.message,
    success: false,
  };

  if (process.env.MODE === 'DEV') {
    response.error = err;
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};
