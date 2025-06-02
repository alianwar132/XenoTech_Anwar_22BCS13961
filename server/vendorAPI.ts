// Dummy Vendor API for simulating message delivery
export interface VendorDeliveryRequest {
  customerId: number;
  customerName: string;
  customerEmail: string;
  message: string;
  campaignId: number;
  logId: number;
}

export interface VendorDeliveryResponse {
  vendorId: string;
  status: 'SENT' | 'FAILED';
  message: string;
}

export class DummyVendorAPI {
  private baseUrl: string;

  constructor(baseUrl = 'http://localhost:5000') {
    this.baseUrl = baseUrl;
  }

  async sendMessage(request: VendorDeliveryRequest): Promise<VendorDeliveryResponse> {
    // Simulate realistic delivery success/failure rates (~90% success, ~10% failure)
    const isSuccess = Math.random() > 0.1;
    const vendorId = `vendor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

    const response: VendorDeliveryResponse = {
      vendorId,
      status: isSuccess ? 'SENT' : 'FAILED',
      message: isSuccess 
        ? `Message delivered successfully to ${request.customerEmail}`
        : `Failed to deliver message: ${this.getRandomFailureReason()}`
    };

    // Simulate hitting the delivery receipt API
    setTimeout(() => {
      this.hitDeliveryReceiptAPI(request, response);
    }, Math.random() * 2000 + 1000);

    return response;
  }

  private getRandomFailureReason(): string {
    const reasons = [
      'Invalid email address',
      'Customer unsubscribed',
      'Email bounced',
      'Rate limit exceeded',
      'Temporary server error'
    ];
    return reasons[Math.floor(Math.random() * reasons.length)];
  }

  private async hitDeliveryReceiptAPI(request: VendorDeliveryRequest, response: VendorDeliveryResponse) {
    try {
      await fetch(`${this.baseUrl}/api/delivery-receipt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          logId: request.logId,
          vendorId: response.vendorId,
          status: response.status,
          deliveredAt: new Date().toISOString(),
          failureReason: response.status === 'FAILED' ? response.message : undefined,
        }),
      });
    } catch (error) {
      console.error('Failed to hit delivery receipt API:', error);
    }
  }
}

export const vendorAPI = new DummyVendorAPI();
