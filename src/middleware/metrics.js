// src/middleware/metrics.js
class Metrics {
    constructor() {
      this.stats = {
        requests: { total: 0, byMethod: {}, byStatus: {} },
        responseTime: { total: 0, count: 0, min: Infinity, max: 0 },
        errors: { total: 0, byType: {} }
      };
      this.startTime = Date.now();
    }
  
    recordRequest(req, res, responseTime) {
      this.stats.requests.total++;
      this.stats.requests.byMethod[req.method] = (this.stats.requests.byMethod[req.method] || 0) + 1;
      this.stats.requests.byStatus[res.statusCode] = (this.stats.requests.byStatus[res.statusCode] || 0) + 1;
  
      this.stats.responseTime.total += responseTime;
      this.stats.responseTime.count++;
      this.stats.responseTime.min = Math.min(this.stats.responseTime.min, responseTime);
      this.stats.responseTime.max = Math.max(this.stats.responseTime.max, responseTime);
  
      if (res.statusCode >= 400) {
        this.stats.errors.total++;
        const errorType = res.statusCode >= 500 ? '5xx' : '4xx';
        this.stats.errors.byType[errorType] = (this.stats.errors.byType[errorType] || 0) + 1;
      }
    }
  
    getStats() {
      const uptime = Date.now() - this.startTime;
      const avgResponseTime = this.stats.responseTime.count > 0 
        ? this.stats.responseTime.total / this.stats.responseTime.count 
        : 0;
  
      return {
        uptime,
        uptimeHuman: this.formatUptime(uptime),
        requests: this.stats.requests,
        responseTime: {
          average: Math.round(avgResponseTime * 100) / 100,
          min: this.stats.responseTime.min === Infinity ? 0 : this.stats.responseTime.min,
          max: this.stats.responseTime.max
        },
        errors: this.stats.errors,
        requestsPerSecond: Math.round((this.stats.requests.total / (uptime / 1000)) * 100) / 100,
        errorRate: this.stats.requests.total > 0 
          ? Math.round((this.stats.errors.total / this.stats.requests.total * 100) * 100) / 100
          : 0
      };
    }
  
    formatUptime(ms) {
      const seconds = Math.floor(ms / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
  
      if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
      if (hours > 0) return `${hours}h ${minutes % 60}m`;
      if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
      return `${seconds}s`;
    }
  
    middleware() {
      return (req, res, next) => {
        const start = Date.now();
  
        const originalEnd = res.end;
        res.end = (...args) => {
          const responseTime = Date.now() - start;
          this.recordRequest(req, res, responseTime);
          originalEnd.apply(res, args);
        };
  
        next();
      };
    }
  }
  
  module.exports = new Metrics();