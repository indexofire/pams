<template>
  <div class="genomes-container">
    <div class="page-header">
      <h1>基因组数据</h1>
      <p>管理和查看基因组序列数据</p>
    </div>

    <div class="content-area">
      <div class="toolbar">
        <el-button type="primary" @click="uploadGenome">
          <el-icon><Upload /></el-icon>
          上传基因组
        </el-button>
        <el-button @click="downloadGenomes">
          <el-icon><Download /></el-icon>
          批量下载
        </el-button>
        <el-button @click="syncGenomes">
          <el-icon><Refresh /></el-icon>
          同步数据
        </el-button>
      </div>

      <div class="filter-section">
        <el-form :inline="true" :model="filterForm">
          <el-form-item label="基因组名称">
            <el-input
              v-model="filterForm.name"
              placeholder="请输入基因组名称"
              clearable
            />
          </el-form-item>
          <el-form-item label="物种">
            <el-select
              v-model="filterForm.species"
              placeholder="请选择物种"
              clearable
            >
              <el-option label="全部" value="" />
              <el-option label="大肠杆菌" value="E.coli" />
              <el-option label="金黄色葡萄球菌" value="S.aureus" />
              <el-option label="肺炎链球菌" value="S.pneumoniae" />
            </el-select>
          </el-form-item>
          <el-form-item label="数据类型">
            <el-select
              v-model="filterForm.dataType"
              placeholder="请选择数据类型"
              clearable
            >
              <el-option label="全部" value="" />
              <el-option label="完整基因组" value="complete" />
              <el-option label="草图基因组" value="draft" />
              <el-option label="转录组" value="transcriptome" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="searchGenomes">查询</el-button>
            <el-button @click="resetFilter">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="table-section">
        <el-table
          :data="genomes"
          v-loading="loading"
          border
          style="width: 100%"
        >
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="name" label="基因组名称" />
          <el-table-column prop="species" label="物种" />
          <el-table-column prop="data_type" label="数据类型" />
          <el-table-column prop="genome_size" label="基因组大小" />
          <el-table-column prop="gc_content" label="GC含量" />
          <el-table-column prop="upload_date" label="上传日期" />
          <el-table-column label="操作" width="250">
            <template #default="scope">
              <el-button size="small" @click="viewGenome(scope.row)">
                查看
              </el-button>
              <el-button size="small" type="success" @click="analyzeGenome(scope.row)">
                分析
              </el-button>
              <el-button size="small" type="warning" @click="downloadGenome(scope.row)">
                下载
              </el-button>
              <el-button size="small" type="danger" @click="deleteGenome(scope.row)">
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
import { Upload, Download, Refresh } from '@element-plus/icons-vue'

export default {
  name: 'Genomes',
  components: {
    Upload,
    Download,
    Refresh
  },
  setup () {
    const loading = ref(false)
    const genomes = ref([])

    const filterForm = reactive({
      name: '',
      species: '',
      dataType: ''
    })

    const pagination = reactive({
      current: 1,
      size: 20,
      total: 0
    })

    const loadGenomes = async () => {
      loading.value = true
      try {
        // TODO: 实现从后端加载基因组数据的逻辑
        // const response = await api.getGenomes(pagination, filterForm)
        // genomes.value = response.data
        // pagination.total = response.total

        // 临时模拟数据
        genomes.value = [
          {
            id: 1,
            name: 'E.coli-001-genome',
            species: 'E.coli',
            data_type: 'complete',
            genome_size: '4.6 Mb',
            gc_content: '50.8%',
            upload_date: '2023-01-15'
          }
        ]
        pagination.total = 1
      } catch (error) {
        console.error('加载基因组数据失败:', error)
      } finally {
        loading.value = false
      }
    }

    const searchGenomes = () => {
      pagination.current = 1
      loadGenomes()
    }

    const resetFilter = () => {
      filterForm.name = ''
      filterForm.species = ''
      filterForm.dataType = ''
      searchGenomes()
    }

    const uploadGenome = () => {
      // TODO: 实现上传基因组的逻辑
      console.log('上传基因组')
    }

    const downloadGenomes = () => {
      // TODO: 实现批量下载基因组的逻辑
      console.log('批量下载基因组')
    }

    const syncGenomes = () => {
      // TODO: 实现同步基因组数据的逻辑
      console.log('同步基因组数据')
    }

    const viewGenome = (genome) => {
      // TODO: 实现查看基因组详情的逻辑
      console.log('查看基因组:', genome)
    }

    const analyzeGenome = (genome) => {
      // TODO: 实现分析基因组的逻辑
      console.log('分析基因组:', genome)
    }

    const downloadGenome = (genome) => {
      // TODO: 实现下载基因组的逻辑
      console.log('下载基因组:', genome)
    }

    const deleteGenome = (genome) => {
      // TODO: 实现删除基因组的逻辑
      console.log('删除基因组:', genome)
    }

    const handleSizeChange = (size) => {
      pagination.size = size
      loadGenomes()
    }

    const handleCurrentChange = (current) => {
      pagination.current = current
      loadGenomes()
    }

    onMounted(() => {
      loadGenomes()
    })

    return {
      loading,
      genomes,
      filterForm,
      pagination,
      searchGenomes,
      resetFilter,
      uploadGenome,
      downloadGenomes,
      syncGenomes,
      viewGenome,
      analyzeGenome,
      downloadGenome,
      deleteGenome,
      handleSizeChange,
      handleCurrentChange
    }
  }
}
</script>

<style scoped>
.genomes-container {
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
