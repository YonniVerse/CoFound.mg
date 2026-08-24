/**
 * Mock API utility — simulates fetch with realistic delays.
 * Returns data from static JSON files in /src/data/
 */

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  meta: Record<string, unknown>;
}

// Simulate network latency (300-800ms)
function randomDelay(): number {
  return Math.floor(Math.random() * 500) + 300;
}

export async function fetchMock<T>(jsonModule: ApiResponse<T>): Promise<ApiResponse<T>> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(jsonModule);
    }, randomDelay());
  });
}
