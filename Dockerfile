FROM gplane/pnpm:8.9.2-node18 AS builder
WORKDIR /app/

ARG URL
ENV VITE_API_BASE_URL=$URL
ADD package.json /app/
RUN pnpm config set registry=https://registry.npmmirror.com/
RUN pnpm install

ADD . /app/
RUN pnpm build


# 基础镜像
FROM nginx
# 删除原有的default.conf文件
RUN rm /etc/nginx/conf.d/default.conf
# 增加自定义nginx.conf文件到对应目录
ADD nginx.conf /etc/nginx/conf.d/
# 将dist目录下的文件复制到nginx内的目录下，与上文对应
COPY --from=builder /app/dist/ /web/basic/