# 🛡️ Lead Recon Agents Guardrails Documentation

## Overview

Comprehensive security, validation, and rate limiting guardrails have been implemented for all Lead Recon agents to ensure production-ready security and reliability.

## 🔒 Security Features

### **Authentication & Authorization**

- **API Key Validation**: All requests require valid API keys
- **Client Identification**: Each request is tied to a client ID
- **Access Control**: Client-specific permissions for different agents
- **Header Validation**: Secure header-based authentication

### **Input Validation & Sanitization**

- **Schema Validation**: Zod schemas for all input types
- **Content Filtering**: XSS and injection attack prevention
- **Sensitive Data Detection**: Automatic detection of PII and sensitive information
- **URL Validation**: Secure URL validation for all web links
- **Email Validation**: Proper email format validation

### **Rate Limiting**

- **Per-Client Limits**: Individual rate limits per client
- **Agent-Specific Limits**: Different limits for different agents
- **Time Windows**: 15-minute rolling windows
- **Graceful Degradation**: Clear error messages when limits exceeded

## 📊 Rate Limiting Configuration

| Agent           | Requests per 15min | Window     | Purpose                                 |
| --------------- | ------------------ | ---------- | --------------------------------------- |
| Profiler        | 10                 | 15 minutes | Heavy processing, ideal client analysis |
| Strategist      | 10                 | 15 minutes | Complex marketing strategy generation   |
| DM Breakthrough | 15                 | 15 minutes | Message generation, lighter processing  |
| Content Creator | 10                 | 15 minutes | Content strategy and generation         |
| Prompt Wizard   | 20                 | 15 minutes | Quick prompt generation                 |

## 🔍 Input Validation Schemas

### **Profiler Agent Schema**

```typescript
{
  eventId: string (1-100 chars),
  website: string (valid URL, optional),
  businessName: string (1-200 chars),
  industry: string (1-100 chars),
  services: string[] (max 20 items, 100 chars each),
  valueProposition: string (1-1000 chars),
  // ... additional optional fields with limits
}
```

### **Strategist Agent Schema**

```typescript
{
  eventId: string (1-100 chars),
  businessName: string (1-200 chars),
  industry: string (1-100 chars),
  services: string[] (max 20 items, 100 chars each),
  valueProposition: string (1-1000 chars),
  // ... marketing-specific fields with validation
}
```

### **DM Breakthrough Agent Schema**

```typescript
{
  eventId: string (1-100 chars),
  prospectName: string (1-100 chars),
  prospectCompany: string (1-200 chars),
  prospectRole: string (1-100 chars),
  businessServices: string[] (max 20 items, 100 chars each),
  businessValueProposition: string (1-1000 chars),
  // ... prospect-specific fields with validation
}
```

### **Content Creator Agent Schema**

```typescript
{
  eventId: string (1-100 chars),
  businessName: string (1-200 chars),
  industry: string (1-100 chars),
  services: string[] (max 20 items, 100 chars each),
  valueProposition: string (1-1000 chars),
  // ... content-specific fields with validation
}
```

### **Prompt Wizard Agent Schema**

```typescript
{
  eventId: string (1-100 chars),
  userRequest: string (1-2000 chars),
  intent: string (max 200 chars, optional),
  useCase: string (max 100 chars, optional),
  complexity: "simple" | "medium" | "advanced" (optional),
  tone: "professional" | "casual" | "urgent" | "friendly" (optional),
  // ... prompt-specific fields with validation
}
```

## 🛡️ Content Security

### **Blocked Patterns**

- `<script>` tags and JavaScript injection
- `javascript:` URLs
- Event handlers (`onclick`, `onload`, etc.)
- `<iframe>`, `<object>`, `<embed>` tags
- `<link>` and `<meta>` tags
- HTML injection attempts

### **Sensitive Data Detection**

- Password fields
- Credit card information
- Social Security Numbers
- Bank account details
- API keys and tokens
- Secret information

### **Input Sanitization**

- HTML/JavaScript removal
- Length limits (10,000 characters max)
- Trimming and normalization
- Special character handling

## 🔐 Authentication Flow

### **Required Headers**

```http
X-API-Key: your-api-key-here
X-Client-ID: your-client-id-here
Content-Type: application/json
```

### **API Key Validation**

1. Extract API key from headers
2. Validate against stored valid keys
3. Check client permissions
4. Log authentication attempts

### **Client Authorization**

1. Verify client ID exists
2. Check agent-specific permissions
3. Validate rate limit eligibility
4. Track usage per client

## 📈 Rate Limiting Implementation

### **Storage**

- In-memory store for development
- Redis recommended for production
- Per-client tracking
- Rolling window implementation

### **Headers**

```http
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1640995200
```

### **Error Responses**

```json
{
  "success": false,
  "error": "Too many profiler requests. Please try again later.",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## 🚨 Error Handling

### **Error Types**

- **Authentication Errors** (401): Invalid or missing API key
- **Authorization Errors** (403): Insufficient permissions
- **Rate Limit Errors** (429): Too many requests
- **Validation Errors** (400): Invalid input data
- **Server Errors** (500): Internal processing errors

### **Error Response Format**

```json
{
  "success": false,
  "error": "Error description",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "details": "Additional error details (optional)"
}
```

### **Logging**

- All errors logged with context
- Sensitive data removed from logs
- Timestamp and agent type included
- Stack traces for debugging

## 🔧 Configuration

### **Environment Variables**

```bash
# API Keys (comma-separated)
VALID_API_KEYS=key1,key2,key3

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
DEFAULT_RATE_LIMIT=10

# Security
ENABLE_CONTENT_FILTERING=true
ENABLE_SENSITIVE_DATA_DETECTION=true
MAX_INPUT_LENGTH=10000
```

### **Production Recommendations**

- Use Redis for rate limiting storage
- Implement API key rotation
- Set up monitoring and alerting
- Use HTTPS only
- Implement request logging
- Set up error tracking (Sentry, DataDog)

## 📊 Monitoring & Analytics

### **Metrics Tracked**

- Request volume per client
- Rate limit hits
- Authentication failures
- Validation errors
- Processing times
- Error rates

### **Alerts**

- High error rates
- Rate limit violations
- Authentication failures
- Unusual traffic patterns
- Performance degradation

## 🚀 Usage Examples

### **Authenticated Request**

```bash
curl -X POST https://api.profiler.solutions/api/lead-recon/profiler \
  -H "X-API-Key: your-api-key" \
  -H "X-Client-ID: client-123" \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "test-001",
    "businessName": "Example Corp",
    "industry": "Technology",
    "services": ["Consulting"],
    "valueProposition": "We help businesses grow"
  }'
```

### **Rate Limit Response**

```json
{
  "success": true,
  "data": {
    /* agent response */
  },
  "eventId": "test-001",
  "rateLimit": {
    "remaining": 7,
    "resetTime": 1640995200000
  }
}
```

### **Error Response**

```json
{
  "success": false,
  "error": "Validation failed: businessName: Required",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## 🔄 Best Practices

### **For Clients**

1. **Store API Keys Securely**: Never expose in client-side code
2. **Handle Rate Limits**: Implement exponential backoff
3. **Validate Inputs**: Pre-validate data before sending
4. **Monitor Usage**: Track rate limit consumption
5. **Error Handling**: Implement proper error handling

### **For Development**

1. **Test Rate Limits**: Verify limits work correctly
2. **Validate Schemas**: Test all input validation
3. **Security Testing**: Test for injection attacks
4. **Performance Testing**: Ensure limits don't impact performance
5. **Monitoring**: Set up proper logging and monitoring

## 🛠️ Troubleshooting

### **Common Issues**

#### **401 Unauthorized**

- Check API key is correct
- Verify API key is in headers
- Ensure API key is active

#### **403 Forbidden**

- Verify client ID is valid
- Check client permissions
- Contact support for access

#### **429 Too Many Requests**

- Wait for rate limit reset
- Implement exponential backoff
- Consider upgrading limits

#### **400 Bad Request**

- Check input validation
- Verify required fields
- Review data format

### **Debug Mode**

```bash
DEBUG=profiler:guardrails npm run dev
```

## 📚 Additional Resources

- [API Documentation](./API.md)
- [Rate Limiting Best Practices](https://cloud.google.com/architecture/rate-limiting-strategies-techniques)
- [Security Guidelines](./SECURITY.md)
- [Monitoring Setup](./MONITORING.md)

---

**Note**: These guardrails are designed to provide enterprise-grade security and reliability for the Lead Recon agents. All agents are now production-ready with comprehensive protection against common security threats and abuse patterns.
