/**
 * Ensures all AI responses adhere to the standard format required by the UI.
 */
class ResponseFormatter {
  /**
   * Format a successful AI response.
   */
  static success({
    provider,
    model,
    data,
    usage = { totalTokens: 0, promptTokens: 0, completionTokens: 0 },
    latency = 0,
    cached = false,
    confidence = 1.0,
    source = 'cloud'
  }) {
    return {
      success: true,
      provider,
      model,
      cached,
      latency,
      usage,
      confidence,
      source,
      data
    };
  }

  /**
   * Format an error AI response.
   */
  static error({
    provider,
    model = 'unknown',
    error,
    latency = 0,
    source = 'cloud'
  }) {
    return {
      success: false,
      provider,
      model,
      latency,
      source,
      error: error.message || String(error),
      data: null
    };
  }
}

module.exports = ResponseFormatter;
