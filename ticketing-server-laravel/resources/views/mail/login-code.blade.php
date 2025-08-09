<!DOCTYPE html>
<html lang="en">

<head></head>

<body>
    <div
        style="font-family: Arial, sans-serif; color: #333; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background-color: #fafafa;">
        <h2 style="color: #2c3e50;">Hi {{ $name }},</h2>

        <p style="font-size: 16px;">
            We received a request to log in to your account.
            Use the verification code below to continue:
        </p>

        <div style="text-align: center; margin: 30px 0;">
            <span
                style="display: inline-block; font-size: 24px; font-weight: bold; color: #ffffff; background-color: #3498db; padding: 10px 20px; border-radius: 6px; letter-spacing: 3px;">
                {{ $code }}
            </span>
        </div>

        <p style="font-size: 14px; color: #555;">
            This code will expire shortly for your security.
            If you did not request this, you can safely ignore this email.
        </p>

        <p style="margin-top: 40px; font-size: 14px; color: #777;">
            Thanks,<br>
            <strong>SMCT Ticketing System</strong>
        </p>
    </div>
</body>

</html>
