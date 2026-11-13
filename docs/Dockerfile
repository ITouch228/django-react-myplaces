FROM python:3.12-slim AS builder
WORKDIR /src
COPY docs/requirements.txt /src/docs/requirements.txt
RUN python -m pip install --no-cache-dir -r /src/docs/requirements.txt
COPY mkdocs.yml /src/mkdocs.yml
COPY docs/ /src/docs/
RUN python -m mkdocs build --strict

FROM nginx:1.27-alpine
COPY --from=builder /src/site/ /usr/share/nginx/html/
EXPOSE 80
