<template>
  <div class="lg-container">
    <div class="lg-main">
      <h3 class="lg-title">{{ lgTitle }}</h3>
      <!-- 登录表单 -->
      <el-form :rules="rules" ref="loginForm" :model="formData">
        <el-form-item prop="user_num">
          <el-input
            v-model="formData['user_num']"
            placeholder="请输入学号或工号"
          ></el-input>
        </el-form-item>
        <el-form-item prop="user_pwd">
          <el-input
            v-model="formData['user_pwd']"
            placeholder="请输入密码"
            type="password"
            show-password
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button
            v-loading="loading"
            class="big-blue-btn"
            @click.native.prevent="authLogin"
            >登录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 表单验证规则
      rules: {
        user_num: [{ required: true, message: "请输入账号", trigger: "blur" }],
        user_pwd: [{ required: true, message: "请输入密码", trigger: "blur" }]
      },
      // 表单数据
      formData: {
        user_num: "",
        user_pwd: ""
      },
      lgTitle: "登录",
      loading: false // 按钮加载中控制
    };
  },
  methods: {
    /**
     * 登录接口
     * */
    authLogin() {
      // 加载中
      this.loading = true;
      // 表单验证
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          // 调用登录方法
          this.$store
            .dispatch("user/login", this.formData)
            .then(() => {
              // 解除加载效果
              this.loading = false;
              this.$message.success("登录成功！");
              this.$router.push({ path: "/async" });
            })
            .catch(() => {
              // 登录失败，这里不用提示了，接口返回时失败就会带提示信息
              this.loading = false;
            });
        } else {
          // 表单校验失败
          this.$message.error("请填写完整信息");
        }
      });
    }
  }
};
</script>

<style scoped>
.big-blue-btn {
  width: 360px;
  height: 48px;
  border-radius: 24px;
  font-size: 18px;
  background-image: linear-gradient(135deg, #65b4ff 0%, #4057e8 100%);
  color: #ffffff !important;
}

.lg-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  text-align: center;
  background: #eeeeee;
}

.lg-main {
  position: absolute;
  width: 440px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #ffffff;
  border-radius: 16px;
  padding: 40px;
}

.lg-title {
  color: #181e33;
  font-size: 20px;
  margin-bottom: 20px;
}

>>> .el-input__inner {
  width: 100%;
  height: 48px;
  border-radius: 24px;
  padding: 0 24px 0 24px;
}
</style>
