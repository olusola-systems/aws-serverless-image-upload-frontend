Week 24 — Serverless Image Upload Frontend
A lightweight frontend for uploading images through a serverless AWS architecture using Amazon CloudFront, API Gateway, AWS Lambda, and Amazon S3.
The application allows a user to select an image, request a presigned S3 upload URL through the API, and upload the image directly to Amazon S3 from the browser.

Architecture
Browser
   |
   v
Amazon CloudFront
   |
   v
API Gateway
   |
   v
AWS Lambda
   |
   v
Presigned S3 URL
   |
   v
Amazon S3

How It Works
1. The user selects an image in the browser.
2. The frontend sends the filename and content type to the /upload-url API endpoint.
3. API Gateway receives the request and invokes the backend Lambda function.
4. Lambda generates a presigned S3 URL.
5. The frontend uses the presigned URL to upload the image directly to Amazon S3.
6. The backend returns the uploaded image metadata and S3 object key.
7. The frontend displays the upload result to the user.

AWS Services
* Amazon CloudFront — Serves the frontend application
* Amazon API Gateway — Provides the /upload-url API endpoint
* AWS Lambda — Generates presigned S3 upload URLs and handles metadata
* Amazon S3 — Stores uploaded images
* Amazon S3 CORS — Allows the browser application to make cross-origin upload requests

Project Structure
aws-serverless-image-upload-frontend/
├── index.html
├── style.css
├── app.js
└── README.md

Frontend
The frontend is built with standard web technologies:
* HTML
* CSS
* JavaScript
* Fetch API
No frontend framework or build system is required.

S3 Upload
The application uses presigned S3 URLs to upload images directly from the browser to Amazon S3.
Instead of sending the image file through Lambda, the backend generates temporary permission for the browser to upload the object directly to S3. This keeps the file transfer separate from the API and avoids unnecessary processing through Lambda.
Uploaded objects follow a structure similar to:
uploads/<image-id>/<filename>

CORS
Because the frontend and S3 bucket are separate origins, the browser requires the appropriate CORS configuration before it can complete the upload.
The S3 bucket was configured to allow requests from the CloudFront origin and permit the HTTP methods and headers required by the browser-based upload flow.

Security
The application uses presigned S3 URLs rather than exposing AWS credentials in the browser.
No AWS access keys or secret credentials are stored in the frontend. The presigned URL provides temporary permission for the specific upload operation.

Deployment
The frontend files are hosted in an Amazon S3 bucket and served through Amazon CloudFront.
The application communicates with the API Gateway endpoint over HTTPS, while the generated presigned URL is used for the direct upload to S3.

Challenges and Troubleshooting
Challenge 1 — API Gateway Returned 401 Unauthorized
Problem: The frontend successfully loaded, but the request to the /upload-url endpoint returned a 401 Unauthorized response, preventing the application from obtaining the presigned S3 upload URL.
Cause: A JWT authorizer was attached to the POST /upload-url route. The frontend was not sending a JWT with the request, so API Gateway rejected the request before it could reach the backend Lambda function.
Resolution: The JWT authorizer was detached from the POST /upload-url route. After removing the authorizer, the browser was able to call the endpoint and receive the upload information required to continue the workflow.

Challenge 2 — Browser-to-S3 Upload Blocked by CORS
Problem: The API request could reach the backend, but the browser-based upload to S3 was being blocked by cross-origin restrictions.
Cause: Browsers enforce CORS rules when a web application hosted on one origin communicates with a resource on another origin. The S3 bucket needed to explicitly allow the CloudFront origin and the HTTP methods required for the upload flow.
Resolution: The S3 bucket CORS configuration was updated to allow the CloudFront distribution as an allowed origin and permit the required request methods and headers. The upload was then tested again from the CloudFront-hosted application.

Challenge 3 — Isolating Which Layer Was Failing
Problem: The application displayed a generic upload failure, making it unclear whether the problem was in the frontend, API Gateway, Lambda, or S3.
Cause: The upload process involves multiple requests — the API call for the presigned URL and the subsequent PUT request that sends the image to S3. A failure in either step produces a similar-looking error in the browser.
Resolution: Chrome DevTools Network tab was used to inspect each request individually — method, status code, headers, payload, and response. This made it possible to identify the failing layer precisely instead of changing multiple AWS configurations at once.

Lessons Learned
This project reinforced how different AWS services can work together to create a serverless application without a traditional backend server. CloudFront delivers the frontend, API Gateway provides the API entry point, Lambda handles the short-lived backend operation, and S3 handles object storage. Each service has a specific responsibility, which makes the architecture easier to reason about and troubleshoot.
One of the most useful lessons was understanding the role of presigned S3 URLs in browser-based applications. Instead of routing an image file through Lambda, the backend generates temporary permission for the browser to upload directly to S3. This separates the API operation from the file transfer and provides a more efficient and secure upload path.
The debugging process showed why understanding the browser’s Network tab is essential when working with cloud applications. A failed upload does not necessarily mean the storage service is the problem. Inspecting individual requests made it possible to identify the 401 Unauthorized response from API Gateway, trace it to the JWT authorizer, and then verify the subsequent CORS and S3 upload behavior in sequence.
Finally, this project reinforced the importance of keeping AWS credentials out of the frontend entirely. Presigned URLs provide a practical way to grant temporary, limited access to a specific S3 operation while the actual credentials remain securely inside Lambda.

Future Improvements
* Add user authentication
* Restrict upload file types and sizes
* Add image preview before upload
* Add upload progress feedback
* Add image listing and retrieval
* Add CloudWatch monitoring and logging
* Add automated deployment with CI/CD

Outcome
Successfully built and deployed a serverless image upload frontend using Amazon CloudFront, API Gateway, AWS Lambda, and Amazon S3. The application allows users to upload images directly from a browser without exposing AWS credentials, using presigned URLs to handle the secure file transfer path.

Next Project
Week 25 — CloudWatch Monitoring and Alerting for the Serverless Pipeline
The serverless pipeline built across Weeks 19 through 24 is functional but not yet fully observable. The next project introduces CloudWatch monitoring, custom metrics, log insights, and alarms across the Lambda functions, API Gateway, and S3 events in the pipeline.
Planned work:
* CloudWatch dashboards for Lambda invocations, errors, and duration
* Log Insights queries for metadata processing events
* CloudWatch alarms for error rate thresholds
* SNS notifications for alarm state changes
* End-to-end visibility across the upload, processing, and retrieval layers
This transforms the pipeline from a working system into an observable one — a foundational requirement for any production serverless application.
