# Official Playwright image: browsers and OS libraries match @playwright/test 1.65.1.
# Keep this tag in sync with the version in package.json.
FROM mcr.microsoft.com/playwright:v1.65.1-noble

ENV CI=1
WORKDIR /app
RUN chown pwuser:pwuser /app

# Run as the image's unprivileged user rather than root.
USER pwuser

COPY --chown=pwuser:pwuser package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY --chown=pwuser:pwuser . .

CMD ["npx", "playwright", "test", "--project=api", "--project=chromium"]
