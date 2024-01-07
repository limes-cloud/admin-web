FROM gplane/pnpm:8.2.0-node18 AS builder
WORKDIR /app/

# 节省构建时间
ADD package.json /app/

# 设置 yarn 用淘宝源安装包
RUN pnpm config set registry=https://registry.npmmirror.com/

ADD . /app/

RUN pnpm install
RUN pnpm install -g increase-memory-limit
RUN pnpm install -g cross-env
RUN pnpm run fix-memory-limit
RUN pnpm build


# 基础镜像
FROM nginx

# 删除原有的default.conf文件
RUN rm /etc/nginx/conf.d/default.conf
# 增加自定义nginx.conf文件到对应目录
ADD nginx.conf /etc/nginx/conf.d/
# 将dist目录下的文件复制到nginx内的目录下，与上文对应
COPY --from=builder app/dist/ /web/basic
