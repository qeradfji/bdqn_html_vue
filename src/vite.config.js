export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/sys-user': {  // 直接代理登录接口
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      }
    }
  }
}) 