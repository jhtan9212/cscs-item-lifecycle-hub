/**
 * Utility functions for extracting user-friendly error messages from API errors
 */

export const getErrorMessage = (error: any): string => {
  // Handle axios errors
  if (error.response) {
    const { status, data } = error.response;

    // Extract error message from response data
    if (data?.error) {
      return data.error;
    }

    if (data?.errors && Array.isArray(data.errors)) {
      return data.errors.map((e: any) => e.message || e).join(', ');
    }

    // Provide user-friendly messages for common status codes
    switch (status) {
      case 400:
        return 'Invalid request. Please check your input and try again.';
      case 401:
        return 'You are not authenticated. Please log in again.';
      case 403:
        return 'You do not have permission to perform this action. Please contact your administrator.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return 'A conflict occurred. The resource may already exist.';
      case 422:
        return 'Validation failed. Please check your input.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'An internal server error occurred. Please try again later.';
      case 503:
        return 'Service is temporarily unavailable. Please try again later.';
      default:
        return `Request failed with status ${status}. Please try again.`;
    }
  }

  // Handle network errors
  if (error.request) {
    return 'Network error. Please check your connection and try again.';
  }

  // Handle other errors
  if (error.message) {
    // Don't show raw axios error messages
    if (error.message.includes('Request failed with status code')) {
      const statusMatch = error.message.match(/status code (\d+)/);
      if (statusMatch) {
        const status = parseInt(statusMatch[1], 10);
        return getErrorMessage({ response: { status, data: {} } });
      }
    }
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
};

