import axios from 'axios';

export const getMessageFromError = (error: unknown): string => {
  const fallback = 'Something went wrong';

  if (typeof error === 'string') return error;

  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data;
    return responseData?.error?.message || responseData?.message || fallback;
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  ) {
    return (error as { message: string }).message || fallback;
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  return fallback;
};
