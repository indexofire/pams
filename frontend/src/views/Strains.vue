<template>
  <div class="strains-container">
    <div class="page-header">
      <h1>菌株管理</h1>
      <p>管理和查看菌株信息</p>
    </div>

    <div class="content-area">
      <div class="toolbar">
        <el-button type="primary" @click="addStrain">
          <el-icon><Plus /></el-icon>
          添加菌株
        </el-button>
        <el-button @click="importStrains">
          <el-icon><Upload /></el-icon>
          导入菌株
        </el-button>
        <el-button @click="exportStrains">
          <el-icon><Download /></el-icon>
          导出菌株
        </el-button>
      </div>

      <div class="filter-section">
        <el-form :inline="true" :model="filterForm">
          <el-form-item label="菌株名称">
            <el-input
              v-model="filterForm.name"
              placeholder="请输入菌株名称"
              clearable
            />
          </el-form-item>
          <el-form-item label="菌株类型">
            <el-select
              v-model="filterForm.type"
              placeholder="请选择菌株类型"
              clearable
            >
              <el-option label="全部" value="" />
              <el-option label="细菌" value="bacteria" />
              <el-option label="真菌" value="fungi" />
              <el-option label="病毒" value="virus" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="searchStrains">查询</el-button>
            <el-button @click="resetFilter">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="table-section">
        <el-table
          :data="strains"
          v-loading="loading"
          border
          style="width: 100%"
        >
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="name" label="菌株名称" />
          <el-table-column prop="type" label="菌株类型" />
          <el-table-column prop="source" label="来源" />
          <el-table-column prop="isolation_date" label="分离日期" />
          <el-table-column prop="created_at" label="创建时间" />
          <el-table-column label="操作" width="200">
            <template #default="scope">
              <el-button size="small" @click="viewStrain(scope.row)">
                查看
              </el-button>
              <el-button size="small" type="warning" @click="editStrain(scope.row)">
                编辑
              </el-button>
              <el-button size="small" type="danger" @click="deleteStrain(scope.row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination">
          <el-pagination
            v-model:current-page="pagination.current"
            v-model:page-size="pagination.size"
            :page-sizes="[10, 20, 50, 100]"
            :total="pagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { Plus, Upload, Download } from '@element-plus/icons-vue'

export default {
  name: 'Strains',
  components: {
    Plus,
    Upload,
    Download
  },
  setup () {
    const loading = ref(false)
    const strains = ref([])

    const filterForm = reactive({
      name: '',
      type: ''
    })

    const pagination = reactive({
      current: 1,
      size: 20,
      total: 0
    })

    const loadStrains = async () => {
      loading.value = true
      try {
        // TODO: 实现从后端加载菌株数据的逻辑
        // const response = await api.getStrains(pagination, filterForm)
        // strains.value = response.data
        // pagination.total = response.total

        // 临时模拟数据
        strains.value = [
          {
            id: 1,
            name: 'E.coli-001',
            type: 'bacteria',
            source: '临床样本',
            isolation_date: '2023-01-15',
            created_at: '2023-01-16'
          }
        ]
        pagination.total = 1
      } catch (error) {
        console.error('加载菌株数据失败:', error)
      } finally {
        loading.value = false
      }
    }

    const searchStrains = () => {
      pagination.current = 1
      loadStrains()
    }

    const resetFilter = () => {
      filterForm.name = ''
      filterForm.type = ''
      searchStrains()
    }

    const addStrain = () => {
      // TODO: 实现添加菌株的逻辑
      console.log('添加菌株')
    }

    const importStrains = () => {
      // TODO: 实现导入菌株的逻辑
      console.log('导入菌株')
    }

    const exportStrains = () => {
      // TODO: 实现导出菌株的逻辑
      console.log('导出菌株')
    }

    const viewStrain = (strain) => {
      // TODO: 实现查看菌株详情的逻辑
      console.log('查看菌株:', strain)
    }

    const editStrain = (strain) => {
      // TODO: 实现编辑菌株的逻辑
      console.log('编辑菌株:', strain)
    }

    const deleteStrain = (strain) => {
      // TODO: 实现删除菌株的逻辑
      console.log('删除菌株:', strain)
    }

    const handleSizeChange = (size) => {
      pagination.size = size
      loadStrains()
    }

    const handleCurrentChange = (current) => {
      pagination.current = current
      loadStrains()
    }

    onMounted(() => {
      loadStrains()
    })

    return {
      loading,
      strains,
      filterForm,
      pagination,
      searchStrains,
      resetFilter,
      addStrain,
      importStrains,
      exportStrains,
      viewStrain,
      editStrain,
      deleteStrain,
      handleSizeChange,
      handleCurrentChange
    }
  }
}
</script>

<style scoped>
.strains-container {
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

.toolbar {
  margin-bottom: 20px;
}

.toolbar .el-button {
  margin-right: 10px;
}

.filter-section {
  margin-bottom: 20px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
}

.table-section {
  margin-top: 20px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}
</style>
