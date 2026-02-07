/**
 * Converts a test_type identifier to a human-readable display name.
 *
 * @param testType - The raw test_type string (e.g., "service_staff", "wine_test")
 * @param testName - Optional test_name from test_configurations (takes priority)
 * @returns A properly formatted display name
 */
export function getTestDisplayName(testType: string, testName?: string | null): string {
  if (testName) return testName;

  const DISPLAY_NAMES: Record<string, string> = {
    service_staff: 'Server & Bartender Test',
    server_assistant: 'Server Assistant Test',
  };

  return (
    DISPLAY_NAMES[testType] ??
    testType
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

/**
 * Returns a subtitle / description for the test pre-start screen.
 */
export function getTestSubtitle(testType: string, testName?: string | null): string {
  if (testName) return 'Knowledge Test';

  const SUBTITLES: Record<string, string> = {
    service_staff: 'Complete Service & Beverage Knowledge',
    server_assistant: 'Essential Service Knowledge',
  };

  return SUBTITLES[testType] ?? 'Knowledge Test';
}
