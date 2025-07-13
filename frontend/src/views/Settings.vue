<template>
  <div class="settings-container">
    <div class="page-header">
      <h1>系统设置</h1>
      <p>系统配置和参数管理</p>
    </div>

    <div class="content-area">
      <el-tabs v-model="activeTab" type="card">
        <el-tab-pane label="基本设置" name="basic">
          <el-form :model="basicForm" label-width="120px">
            <el-form-item label="系统名称">
              <el-input v-model="basicForm.systemName" placeholder="请输入系统名称" />
            </el-form-item>
            <el-form-item label="系统版本">
              <el-input v-model="basicForm.systemVersion" placeholder="请输入系统版本" readonly />
            </el-form-item>
            <el-form-item label="管理员邮箱">
              <el-input v-model="basicForm.adminEmail" placeholder="请输入管理员邮箱" />
            </el-form-item>
            <el-form-item label="系统描述">
              <el-input
                v-model="basicForm.systemDescription"
                type="textarea"
                :rows="3"
                placeholder="请输入系统描述"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveBasicSettings">保存设置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="数据库设置" name="database">
          <el-form :model="databaseForm" label-width="120px">
            <el-form-item label="数据库类型">
              <el-select v-model="databaseForm.type" placeholder="请选择数据库类型">
                <el-option label="SQLite" value="sqlite" />
                <el-option label="MySQL" value="mysql" />
                <el-option label="PostgreSQL" value="postgresql" />
              </el-select>
            </el-form-item>
            <el-form-item label="数据库主机">
              <el-input v-model="databaseForm.host" placeholder="请输入数据库主机" />
            </el-form-item>
            <el-form-item label="数据库端口">
              <el-input v-model="databaseForm.port" placeholder="请输入数据库端口" />
            </el-form-item>
            <el-form-item label="数据库名称">
              <el-input v-model="databaseForm.database" placeholder="请输入数据库名称" />
            </el-form-item>
            <el-form-item label="用户名">
              <el-input v-model="databaseForm.username" placeholder="请输入用户名" />
            </el-form-item>
            <el-form-item label="密码">
              <el-input
                v-model="databaseForm.password"
                type="password"
                placeholder="请输入密码"
                show-password
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="testDatabaseConnection">测试连接</el-button>
              <el-button @click="saveDatabaseSettings">保存设置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="分析工具" name="tools">
          <el-form :model="toolsForm" label-width="120px">
            <el-form-item label="BLAST路径">
              <el-input v-model="toolsForm.blastPath" placeholder="请输入BLAST工具路径" />
            </el-form-item>
            <el-form-item label="Prokka路径">
              <el-input v-model="toolsForm.prokkaPath" placeholder="请输入Prokka工具路径" />
            </el-form-item>
            <el-form-item label="MLST路径">
              <el-input v-model="toolsForm.mlstPath" placeholder="请输入MLST工具路径" />
            </el-form-item>
            <el-form-item label="ABRicate路径">
              <el-input v-model="toolsForm.abricatePath" placeholder="请输入ABRicate工具路径" />
            </el-form-item>
            <el-form-item label="最大并发任务">
              <el-input-number
                v-model="toolsForm.maxConcurrentTasks"
                :min="1"
                :max="10"
                placeholder="请输入最大并发任务数"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveToolsSettings">保存设置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="存储设置" name="storage">
          <el-form :model="storageForm" label-width="120px">
            <el-form-item label="数据存储路径">
              <el-input v-model="storageForm.dataPath" placeholder="请输入数据存储路径" />
            </el-form-item>
            <el-form-item label="临时文件路径">
              <el-input v-model="storageForm.tempPath" placeholder="请输入临时文件路径" />
            </el-form-item>
            <el-form-item label="日志文件路径">
              <el-input v-model="storageForm.logPath" placeholder="请输入日志文件路径" />
            </el-form-item>
            <el-form-item label="最大存储空间">
              <el-input v-model="storageForm.maxStorageSize" placeholder="请输入最大存储空间(GB)" />
            </el-form-item>
            <el-form-item label="自动清理">
              <el-switch v-model="storageForm.autoCleanup" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveStorageSettings">保存设置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'

export default {
  name: 'Settings',
  setup () {
    const activeTab = ref('basic')

    const basicForm = reactive({
      systemName: 'PAMS - 病原菌基因组分析系统',
      systemVersion: '1.0.0',
      adminEmail: 'admin@pams.com',
      systemDescription: '基于生物信息学的病原菌基因组分析管理系统'
    })

    const databaseForm = reactive({
      type: 'sqlite',
      host: 'localhost',
      port: '3306',
      database: 'pams',
      username: 'root',
      password: ''
    })

    const toolsForm = reactive({
      blastPath: '/usr/local/bin/blast',
      prokkaPath: '/usr/local/bin/prokka',
      mlstPath: '/usr/local/bin/mlst',
      abricatePath: '/usr/local/bin/abricate',
      maxConcurrentTasks: 4
    })

    const storageForm = reactive({
      dataPath: '/var/lib/pams/data',
      tempPath: '/tmp/pams',
      logPath: '/var/log/pams',
      maxStorageSize: '100',
      autoCleanup: true
    })

    const loadSettings = async () => {
      try {
        // TODO: 实现从后端加载设置的逻辑
        // const response = await api.getSettings()
        // Object.assign(basicForm, response.basic)
        // Object.assign(databaseForm, response.database)
        // Object.assign(toolsForm, response.tools)
        // Object.assign(storageForm, response.storage)

        console.log('加载设置')
      } catch (error) {
        console.error('加载设置失败:', error)
      }
    }

    const saveBasicSettings = async () => {
      try {
        // TODO: 实现保存基本设置的逻辑
        // await api.saveBasicSettings(basicForm)
        console.log('保存基本设置:', basicForm)
        ElMessage.success('基本设置保存成功')
      } catch (error) {
        console.error('保存基本设置失败:', error)
        ElMessage.error('保存基本设置失败')
      }
    }

    const testDatabaseConnection = async () => {
      try {
        // TODO: 实现测试数据库连接的逻辑
        // await api.testDatabaseConnection(databaseForm)
        console.log('测试数据库连接:', databaseForm)
        ElMessage.success('数据库连接测试成功')
      } catch (error) {
        console.error('数据库连接测试失败:', error)
        ElMessage.error('数据库连接测试失败')
      }
    }

    const saveDatabaseSettings = async () => {
      try {
        // TODO: 实现保存数据库设置的逻辑
        // await api.saveDatabaseSettings(databaseForm)
        console.log('保存数据库设置:', databaseForm)
        ElMessage.success('数据库设置保存成功')
      } catch (error) {
        console.error('保存数据库设置失败:', error)
        ElMessage.error('保存数据库设置失败')
      }
    }

    const saveToolsSettings = async () => {
      try {
        // TODO: 实现保存工具设置的逻辑
        // await api.saveToolsSettings(toolsForm)
        console.log('保存工具设置:', toolsForm)
        ElMessage.success('工具设置保存成功')
      } catch (error) {
        console.error('保存工具设置失败:', error)
        ElMessage.error('保存工具设置失败')
      }
    }

    const saveStorageSettings = async () => {
      try {
        // TODO: 实现保存存储设置的逻辑
        // await api.saveStorageSettings(storageForm)
        console.log('保存存储设置:', storageForm)
        ElMessage.success('存储设置保存成功')
      } catch (error) {
        console.error('保存存储设置失败:', error)
        ElMessage.error('保存存储设置失败')
      }
    }

    onMounted(() => {
      loadSettings()
    })

    return {
      activeTab,
      basicForm,
      databaseForm,
      toolsForm,
      storageForm,
      saveBasicSettings,
      testDatabaseConnection,
      saveDatabaseSettings,
      saveToolsSettings,
      saveStorageSettings
    }
  }
}
</script>

<style scoped>
.settings-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0 0 8px 0;
  color: #303133;
}

.page-header p {
  margin: 0;
  color: #606266;
}

.content-area {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.el-form {
  max-width: 600px;
}

.el-form-item {
  margin-bottom: 20px;
}

.el-tabs {
  margin-top: 20px;
}

.el-tab-pane {
  padding: 20px 0;
}
</style>
