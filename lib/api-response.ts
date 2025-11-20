// FILE: lib/api-response.ts

export class ApiResponse<T> {
  static success<T>(data: T) {
    return NextResponse.json({ success: true, data });
  }
  
  static error(message: string, status: number = 500) {
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
