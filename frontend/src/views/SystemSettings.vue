<template>
  <div class="system-settings-container">
    <div class="page-header">
      <h1>系统设置</h1>
      <p>系统配置和管理</p>
    </div>

    <div class="content-area">
      <!-- 实验相关设置区块 -->
      <div class="settings-section">
        <div class="section-header">
          <h2>实验相关设置</h2>
          <p>管理实验相关的配置信息</p>
        </div>
        <el-tabs v-model="experimentTab" type="card" class="experiment-tabs">
          <!-- 菌种管理 -->
          <el-tab-pane label="菌种管理" name="species">
            <div class="species-management">
              <div class="toolbar">
                <el-button type="primary" @click="addSpecies">
                  <el-icon><Plus /></el-icon>
                  添加菌种
                </el-button>
              </div>

              <el-table
                :data="speciesOptions"
                border
                style="width: 100%"
                :height="400"
                :table-layout="'fixed'"
              >
                <el-table-column prop="id" label="ID" width="80" />
                <el-table-column prop="name" label="菌种名称" min-width="120" />
                <el-table-column prop="scientific_name" label="学名" width="180">
                  <template #default="scope">
                    <em>{{ scope.row.scientific_name }}</em>
                  </template>
                </el-table-column>
                <el-table-column prop="abbreviation" label="缩写" width="80" />
                <el-table-column prop="ncbi_txid" label="NCBI TXID" width="100">
                  <template #default="scope">
                    <span v-if="scope.row.ncbi_txid">
                      <a :href="`https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=${scope.row.ncbi_txid}`"
                         target="_blank"
                         style="color: #409eff; text-decoration: none;">
                        {{ scope.row.ncbi_txid }}
                      </a>
                    </span>
                    <span v-else style="color: #909399;">-</span>
                  </template>
                </el-table-column>
                <el-table-column prop="description" label="描述" min-width="150" />
                <el-table-column prop="status" label="状态" width="100">
                  <template #default="scope">
                    <el-tag
                      :type="scope.row.status === 'active' ? 'success' : 'danger'"
                      size="small"
                    >
                      {{ scope.row.status === 'active' ? '启用' : '禁用' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="200">
                  <template #default="scope">
                    <el-button size="small" @click="editSpecies(scope.row)">编辑</el-button>
                    <el-button
                      size="small"
                      :type="scope.row.status === 'active' ? 'warning' : 'success'"
                      @click="toggleSpeciesStatus(scope.row)"
                    >
                      {{ scope.row.status === 'active' ? '禁用' : '启用' }}
                    </el-button>
                    <el-button
                      size="small"
                      type="danger"
                      @click="deleteSpecies(scope.row)"
                    >
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>

          <!-- 地区管理 -->
          <el-tab-pane label="地区管理" name="regions">
            <div class="region-management">
              <div class="toolbar">
                <el-button type="primary" @click="addRegion">
                  <el-icon><Plus /></el-icon>
                  添加地区
                </el-button>
              </div>

              <el-table
                :data="regionOptions"
                border
                style="width: 100%"
                :height="400"
                :table-layout="'fixed'"
              >
                <el-table-column prop="id" label="ID" width="80" />
                <el-table-column prop="name" label="地区名称" min-width="150" />
                <el-table-column prop="code" label="地区代码" width="120" />
                <el-table-column prop="level" label="级别" width="100">
                  <template #default="scope">
                    <el-tag
                      :type="scope.row.level === 'province' ? 'danger' : scope.row.level === 'city' ? 'warning' : 'primary'"
                      size="small"
                    >
                      {{ scope.row.level === 'province' ? '省/直辖市' : scope.row.level === 'city' ? '市' : '区/县' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="100">
                  <template #default="scope">
                    <el-tag
                      :type="scope.row.status === 'active' ? 'success' : 'danger'"
                      size="small"
                    >
                      {{ scope.row.status === 'active' ? '启用' : '禁用' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="200">
                  <template #default="scope">
                    <el-button size="small" @click="editRegion(scope.row)">编辑</el-button>
                    <el-button
                      size="small"
                      :type="scope.row.status === 'active' ? 'warning' : 'success'"
                      @click="toggleRegionStatus(scope.row)"
                    >
                      {{ scope.row.status === 'active' ? '禁用' : '启用' }}
                    </el-button>
                    <el-button
                      size="small"
                      type="danger"
                      @click="deleteRegion(scope.row)"
                    >
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>

          <!-- 样本来源管理 -->
          <el-tab-pane label="样本来源管理" name="sources">
            <div class="source-management">
              <div class="toolbar">
                <el-button type="primary" @click="addSource">
                  <el-icon><Plus /></el-icon>
                  添加样本来源
                </el-button>
              </div>

              <el-table
                :data="sourceOptions"
                border
                style="width: 100%"
                :height="400"
                :table-layout="'fixed'"
              >
                <el-table-column prop="id" label="ID" width="80" />
                <el-table-column prop="name" label="来源名称" min-width="150" />
                <el-table-column prop="category" label="类别" width="120">
                  <template #default="scope">
                    <el-tag
                      :type="scope.row.category === 'clinical' ? 'danger' : scope.row.category === 'environmental' ? 'warning' : 'primary'"
                      size="small"
                    >
                      {{ scope.row.category === 'clinical' ? '临床' : scope.row.category === 'environmental' ? '环境' : '其他' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="description" label="描述" min-width="200" />
                <el-table-column prop="status" label="状态" width="100">
                  <template #default="scope">
                    <el-tag
                      :type="scope.row.status === 'active' ? 'success' : 'danger'"
                      size="small"
                    >
                      {{ scope.row.status === 'active' ? '启用' : '禁用' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="200">
                  <template #default="scope">
                    <el-button size="small" @click="editSource(scope.row)">编辑</el-button>
                    <el-button
                      size="small"
                      :type="scope.row.status === 'active' ? 'warning' : 'success'"
                      @click="toggleSourceStatus(scope.row)"
                    >
                      {{ scope.row.status === 'active' ? '禁用' : '启用' }}
                    </el-button>
                    <el-button
                      size="small"
                      type="danger"
                      @click="deleteSource(scope.row)"
                    >
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>

          <!-- 实验类型管理 -->
          <el-tab-pane label="实验类型管理" name="experiments">
            <div class="experiment-management">
              <div class="toolbar">
                <el-button type="primary" @click="addExperiment">
                  <el-icon><Plus /></el-icon>
                  添加实验类型
                </el-button>
              </div>

              <el-table
                :data="experimentTypes"
                border
                style="width: 100%"
                :height="400"
                :table-layout="'fixed'"
              >
                <el-table-column prop="id" label="ID" width="80" />
                <el-table-column prop="name" label="实验类型" min-width="150" />
                <el-table-column prop="description" label="描述" min-width="200" />
                <el-table-column prop="protocol" label="实验协议" min-width="200" />
                <el-table-column prop="status" label="状态" width="100">
                  <template #default="scope">
                    <el-tag
                      :type="scope.row.status === 'active' ? 'success' : 'danger'"
                      size="small"
                    >
                      {{ scope.row.status === 'active' ? '启用' : '禁用' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="200">
                  <template #default="scope">
                    <el-button size="small" @click="editExperiment(scope.row)">编辑</el-button>
                    <el-button
                      size="small"
                      :type="scope.row.status === 'active' ? 'warning' : 'success'"
                      @click="toggleExperimentStatus(scope.row)"
                    >
                      {{ scope.row.status === 'active' ? '禁用' : '启用' }}
                    </el-button>
                    <el-button
                      size="small"
                      type="danger"
                      @click="deleteExperiment(scope.row)"
                    >
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 系统相关设置区块 -->
      <div class="settings-section">
        <div class="section-header">
          <h2>系统相关设置</h2>
          <p>管理系统配置和用户权限</p>
        </div>
        <el-tabs v-model="systemTab" type="card" class="system-tabs">
        <!-- 用户管理 -->
        <el-tab-pane label="用户管理" name="users">
          <div class="user-management">
            <div class="toolbar">
              <el-button type="primary" @click="addUser">
                <el-icon><Plus /></el-icon>
                添加用户
              </el-button>
              <el-button @click="refreshUsers">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </div>

            <el-table
              :data="users"
              border
              style="width: 100%"
              :height="400"
              :table-layout="'fixed'"
            >
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column prop="username" label="用户名" />
              <el-table-column prop="role" label="角色" width="120">
                <template #default="scope">
                  <el-tag
                    :type="scope.row.role === 'admin' ? 'danger' : scope.row.role === 'advanced' ? 'warning' : 'primary'"
                    size="small"
                  >
                    {{ getRoleLabel(scope.row.role) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="createdAt" label="创建时间" width="180" />
              <el-table-column label="操作" width="200">
                <template #default="scope">
                  <el-button size="small" @click="editUser(scope.row)">编辑</el-button>
                  <el-button
                    size="small"
                    type="danger"
                    @click="deleteUser(scope.row)"
                    :disabled="scope.row.username === 'admin'"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

          <!-- 基本设置 -->
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

        <!-- 数据库设置 -->
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
              <el-input v-model="databaseForm.password" type="password" placeholder="请输入密码" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="testDatabaseConnection">测试连接</el-button>
              <el-button @click="saveDatabaseSettings">保存设置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 路径设置 -->
        <el-tab-pane label="路径设置" name="paths">
          <el-form :model="pathForm" label-width="150px">
            <el-form-item label="基因组数据保存路径">
              <el-input v-model="pathForm.genomesPath" placeholder="请输入基因组数据保存路径">
                <template #append>
                  <el-button @click="selectGenomesPath">选择</el-button>
                </template>
              </el-input>
              <div class="form-help">基因组文件上传后的保存目录</div>
            </el-form-item>

            <el-form-item label="SQLite数据库路径">
              <el-input v-model="pathForm.databasePath" placeholder="请输入SQLite数据库文件路径">
                <template #append>
                  <el-button @click="selectDatabasePath">选择</el-button>
                </template>
              </el-input>
              <div class="form-help">SQLite数据库文件的存储路径</div>
            </el-form-item>

            <el-form-item label="分析结果保存路径">
              <el-input v-model="pathForm.analysisPath" placeholder="请输入分析结果保存路径">
                <template #append>
                  <el-button @click="selectAnalysisPath">选择</el-button>
                </template>
              </el-input>
              <div class="form-help">分析结果和报告的保存目录</div>
            </el-form-item>

            <el-form-item label="临时文件路径">
              <el-input v-model="pathForm.tempPath" placeholder="请输入临时文件路径">
                <template #append>
                  <el-button @click="selectTempPath">选择</el-button>
                </template>
              </el-input>
              <div class="form-help">临时文件和缓存的存储目录</div>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="savePathSettings">保存路径设置</el-button>
              <el-button @click="resetPathSettings">重置为默认</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>

    <!-- 用户编辑对话框 -->
    <el-dialog v-model="userDialogVisible" title="用户管理" width="600px">
      <el-form :model="userForm" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="userForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" v-if="!userForm.id">
          <el-input v-model="userForm.password" type="password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="userForm.role" placeholder="请选择角色">
            <el-option label="管理员" value="admin" />
            <el-option label="高级用户" value="advanced" />
            <el-option label="普通用户" value="user" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="userDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveUser">确定</el-button>
      </template>
    </el-dialog>

    <!-- 菌种编辑对话框 -->
    <el-dialog v-model="speciesDialogVisible" title="菌种管理" width="700px">
      <el-form :model="speciesForm" label-width="100px">
        <el-form-item label="菌种名称" required>
          <el-input v-model="speciesForm.name" placeholder="请输入菌种名称" />
        </el-form-item>
        <el-form-item label="学名" required>
          <el-input
            v-model="speciesForm.scientific_name"
            placeholder="请输入学名，如：Escherichia coli"
            @blur="onScientificNameChange"
          />
        </el-form-item>
        <el-form-item label="缩写">
          <el-input
            v-model="speciesForm.abbreviation"
            placeholder="自动生成或手动输入"
            style="width: 200px;"
          >
            <template #append>
              <el-button @click="generateAbbreviation" :loading="abbreviationLoading">
                自动生成
              </el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="NCBI TXID">
          <el-input
            v-model="speciesForm.ncbi_txid"
            placeholder="从NCBI获取或手动输入"
            style="width: 200px;"
          >
            <template #append>
              <el-button @click="searchNCBITaxonomy" :loading="ncbiLoading">
                从NCBI获取
              </el-button>
            </template>
          </el-input>
          <div v-if="ncbiSearchResult" class="ncbi-result" style="margin-top: 8px;">
            <el-alert
              :type="ncbiSearchResult.success ? 'success' : 'error'"
              :title="ncbiSearchResult.success ? 'NCBI信息获取成功' : 'NCBI信息获取失败'"
              :description="ncbiSearchResult.success ?
                `TXID: ${ncbiSearchResult.txid}, 学名: ${ncbiSearchResult.scientificName}` :
                ncbiSearchResult.error"
              show-icon
              :closable="false"
            />
          </div>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="speciesForm.description" type="textarea" :rows="3" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="speciesForm.status" placeholder="请选择状态">
            <el-option label="启用" value="active" />
            <el-option label="禁用" value="inactive" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="speciesDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveSpecies" :loading="saveLoading">确定</el-button>
      </template>
    </el-dialog>

    <!-- 地区编辑对话框 -->
    <el-dialog v-model="regionDialogVisible" title="地区管理" width="600px">
      <el-form :model="regionForm" label-width="80px">
        <el-form-item label="地区名称">
          <el-input v-model="regionForm.name" placeholder="请输入地区名称" />
        </el-form-item>
        <el-form-item label="地区代码">
          <el-input v-model="regionForm.code" placeholder="请输入地区代码" />
        </el-form-item>
        <el-form-item label="级别">
          <el-select v-model="regionForm.level" placeholder="请选择级别">
            <el-option label="省/直辖市" value="province" />
            <el-option label="市" value="city" />
            <el-option label="区/县" value="district" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="regionForm.status" placeholder="请选择状态">
            <el-option label="启用" value="active" />
            <el-option label="禁用" value="inactive" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="regionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveRegion">确定</el-button>
      </template>
    </el-dialog>

    <!-- 样本来源编辑对话框 -->
    <el-dialog v-model="sourceDialogVisible" title="样本来源管理" width="600px">
      <el-form :model="sourceForm" label-width="80px">
        <el-form-item label="来源名称">
          <el-input v-model="sourceForm.name" placeholder="请输入样本来源名称" />
        </el-form-item>
        <el-form-item label="类别">
          <el-select v-model="sourceForm.category" placeholder="请选择类别">
            <el-option label="临床" value="clinical" />
            <el-option label="食品" value="food" />
            <el-option label="环境" value="environmental" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="sourceForm.description" type="textarea" :rows="3" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="sourceForm.status" placeholder="请选择状态">
            <el-option label="启用" value="active" />
            <el-option label="禁用" value="inactive" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="sourceDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveSource">确定</el-button>
      </template>
    </el-dialog>

    <!-- 实验类型编辑对话框 -->
    <el-dialog v-model="experimentDialogVisible" title="实验类型管理" width="600px">
      <el-form :model="experimentForm" label-width="80px">
        <el-form-item label="实验类型">
          <el-input v-model="experimentForm.name" placeholder="请输入实验类型名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="experimentForm.description" type="textarea" :rows="3" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="实验协议">
          <el-input v-model="experimentForm.protocol" type="textarea" :rows="5" placeholder="请输入实验协议" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="experimentForm.status" placeholder="请选择状态">
            <el-option label="启用" value="active" />
            <el-option label="禁用" value="inactive" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="experimentDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveExperiment">确定</el-button>
      </template>
    </el-dialog>
</template>

<script>
import { ref, reactive, onMounted, onErrorCaptured, nextTick, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh } from '@element-plus/icons-vue'
import { useStore } from 'vuex'

export default {
  name: 'SystemSettings',
  components: {
    Plus,
    Refresh
  },
  setup () {
    const store = useStore()
    const experimentTab = ref('species')
    const systemTab = ref('users')

    // 用户管理相关
    const users = ref([])

    const userDialogVisible = ref(false)
    const userForm = reactive({
      id: null,
      username: '',
      password: '',
      role: 'user'
    })

    // 菌种管理相关
    const speciesOptions = ref([
      { id: 1, name: '大肠杆菌', scientific_name: 'Escherichia coli', description: '常见的肠道细菌', status: 'active' },
      { id: 2, name: '金黄色葡萄球菌', scientific_name: 'Staphylococcus aureus', description: '常见的致病菌', status: 'active' },
      { id: 3, name: '肺炎链球菌', scientific_name: 'Streptococcus pneumoniae', description: '引起肺炎的细菌', status: 'active' }
    ])

    const speciesDialogVisible = ref(false)
    const speciesForm = reactive({
      id: null,
      name: '',
      scientific_name: '',
      abbreviation: '',
      ncbi_txid: '',
      description: '',
      status: 'active'
    })

    // NCBI相关状态
    const ncbiLoading = ref(false)
    const abbreviationLoading = ref(false)
    const saveLoading = ref(false)
    const ncbiSearchResult = ref(null)

    // 地区管理相关
    const regionOptions = ref([
      { id: 1, name: '北京市', code: 'BJ', level: 'province', status: 'active' },
      { id: 2, name: '上海市', code: 'SH', level: 'province', status: 'active' },
      { id: 3, name: '广东省', code: 'GD', level: 'province', status: 'active' },
      { id: 4, name: '江苏省', code: 'JS', level: 'province', status: 'active' },
      { id: 5, name: '浙江省', code: 'ZJ', level: 'province', status: 'active' }
    ])
    const regionDialogVisible = ref(false)
    const regionForm = reactive({
      id: null,
      name: '',
      code: '',
      level: 'province',
      status: 'active'
    })

    // 样本来源管理相关
    const sourceOptions = ref([
      { id: 1, name: '血液', category: 'clinical', description: '临床血液样本', status: 'active' },
      { id: 2, name: '粪便', category: 'clinical', description: '临床粪便样本', status: 'active' },
      { id: 3, name: '尿液', category: 'clinical', description: '临床尿液样本', status: 'active' },
      { id: 4, name: '肉类', category: 'food', description: '食品肉类样本', status: 'active' },
      { id: 5, name: '饮用水', category: 'environmental', description: '环境水样', status: 'active' },
      { id: 6, name: '土壤', category: 'environmental', description: '环境土样', status: 'active' }
    ])
    const sourceDialogVisible = ref(false)
    const sourceForm = reactive({
      id: null,
      name: '',
      category: 'clinical',
      description: '',
      status: 'active'
    })

    // 实验管理相关 - 初始化为空数组，避免数据重复更新
    const experimentTypes = ref([])

    const experimentDialogVisible = ref(false)
    const experimentForm = reactive({
      id: null,
      name: '',
      description: '',
      protocol: '',
      status: 'active'
    })

    // 基本设置
    const basicForm = reactive({
      systemName: 'PAMS - 细菌基因组管理系统',
      systemVersion: '1.0.0',
      adminEmail: 'admin@pams.com',
      systemDescription: '用于细菌基因组数据管理和分析的综合平台'
    })

    // 数据库设置
    const databaseForm = reactive({
      type: 'sqlite',
      host: 'localhost',
      port: '3306',
      database: 'pams',
      username: '',
      password: ''
    })

    // 路径设置
    const pathForm = reactive({
      genomesPath: '',
      databasePath: '',
      analysisPath: '',
      tempPath: ''
    })

    // 用户管理方法
    const getRoleLabel = (role) => {
      const roleMap = {
        admin: '管理员',
        advanced: '高级用户',
        user: '普通用户'
      }
      return roleMap[role] || role
    }

    const addUser = () => {
      Object.assign(userForm, { id: null, username: '', password: '', role: 'user' })
      userDialogVisible.value = true
    }

    const editUser = (user) => {
      Object.assign(userForm, { ...user, password: '' })
      userDialogVisible.value = true
    }

    const saveUser = async () => {
      try {
        if (userForm.id) {
          // 更新用户
          if (window.electronAPI && window.electronAPI.users) {
            await window.electronAPI.users.update(userForm.id, {
              username: userForm.username,
              role: userForm.role,
              password: userForm.password || undefined
            })
          } else {
            // 开发环境模拟
            const index = users.value.findIndex(u => u.id === userForm.id)
            if (index !== -1) {
              users.value[index] = { ...userForm, created_at: users.value[index].created_at }
            }
          }
          ElMessage.success('用户更新成功')
        } else {
          // 添加用户
          if (window.electronAPI && window.electronAPI.users) {
            await window.electronAPI.users.create({
              username: userForm.username,
              password: userForm.password,
              role: userForm.role
            })
          } else {
            // 开发环境模拟
            const newUser = {
              id: Date.now(),
              username: userForm.username,
              role: userForm.role,
              created_at: new Date().toLocaleString()
            }
            users.value.push(newUser)
          }
          ElMessage.success('用户添加成功')
        }
        userDialogVisible.value = false
        await loadUsers()
      } catch (error) {
        ElMessage.error(error.message || '操作失败')
      }
    }

    const deleteUser = async (user) => {
      try {
        await ElMessageBox.confirm('确定要删除该用户吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        if (window.electronAPI && window.electronAPI.users) {
          await window.electronAPI.users.delete(user.id)
        } else {
          // 开发环境模拟
          const index = users.value.findIndex(u => u.id === user.id)
          if (index !== -1) {
            users.value.splice(index, 1)
          }
        }
        ElMessage.success('用户删除成功')
        await loadUsers()
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error(error.message || '删除失败')
        }
      }
    }

    const loadUsers = async () => {
      try {
        if (window.electronAPI && window.electronAPI.users) {
          const userList = await window.electronAPI.users.getAll()
          users.value = userList || []
        } else {
          // 开发环境模拟数据
          users.value = [
            { id: 1, username: 'admin', role: 'admin', createdAt: '2023-01-01 10:00:00' },
            { id: 2, username: 'advanced', role: 'advanced', createdAt: '2023-01-02 10:00:00' },
            { id: 3, username: 'user', role: 'user', createdAt: '2023-01-03 10:00:00' }
          ]
        }
      } catch (error) {
        console.error('加载用户列表失败:', error)
        ElMessage.error('加载用户列表失败')
      }
    }

    const refreshUsers = async () => {
      await loadUsers()
      ElMessage.success('用户列表刷新成功')
    }

    // 菌种管理方法
    const addSpecies = () => {
      Object.assign(speciesForm, {
        id: null,
        name: '',
        scientific_name: '',
        abbreviation: '',
        ncbi_txid: '',
        description: '',
        status: 'active'
      })
      ncbiSearchResult.value = null
      speciesDialogVisible.value = true
    }

    const editSpecies = (species) => {
      Object.assign(speciesForm, species)
      ncbiSearchResult.value = null
      speciesDialogVisible.value = true
    }

    // NCBI相关方法
    const generateAbbreviation = async () => {
      if (!speciesForm.scientific_name) {
        ElMessage.warning('请先输入学名')
        return
      }

      abbreviationLoading.value = true
      try {
        if (window.electronAPI && window.electronAPI.ncbi) {
          const abbreviation = await window.electronAPI.ncbi.generateAbbreviation(speciesForm.scientific_name)
          speciesForm.abbreviation = abbreviation
          ElMessage.success('缩写生成成功')
        } else {
          // 浏览器环境下的简单生成逻辑
          const parts = speciesForm.scientific_name.trim().split(/\s+/)
          if (parts.length >= 2) {
            const genus = parts[0].charAt(0).toUpperCase()
            const species = parts[1].substring(0, 3).toLowerCase()
            speciesForm.abbreviation = genus + species
            ElMessage.success('缩写生成成功')
          }
        }
      } catch (error) {
        console.error('生成缩写失败:', error)
        ElMessage.error('生成缩写失败: ' + error.message)
      } finally {
        abbreviationLoading.value = false
      }
    }

    const searchNCBITaxonomy = async () => {
      if (!speciesForm.scientific_name) {
        ElMessage.warning('请先输入学名')
        return
      }

      ncbiLoading.value = true
      ncbiSearchResult.value = null

      try {
        if (window.electronAPI && window.electronAPI.ncbi) {
          const result = await window.electronAPI.ncbi.searchTaxonomyId(speciesForm.scientific_name)
          ncbiSearchResult.value = result

          if (result.success) {
            speciesForm.ncbi_txid = result.txid
            ElMessage.success('NCBI信息获取成功')
          } else {
            ElMessage.error('NCBI信息获取失败: ' + result.error)
          }
        } else {
          ElMessage.warning('NCBI功能仅在Electron环境下可用')
        }
      } catch (error) {
        console.error('搜索NCBI失败:', error)
        ElMessage.error('搜索NCBI失败: ' + error.message)
        ncbiSearchResult.value = {
          success: false,
          error: error.message
        }
      } finally {
        ncbiLoading.value = false
      }
    }

    const onScientificNameChange = () => {
      // 当学名改变时，清除之前的NCBI搜索结果
      ncbiSearchResult.value = null
    }

    const saveSpecies = async () => {
      saveLoading.value = true
      try {
        if (window.electronAPI && window.electronAPI.systemConfig) {
          // 使用后端API保存菌种配置
          const savedSpecies = await window.electronAPI.systemConfig.saveSpecies(speciesForm)

          if (speciesForm.id) {
            // 更新菌种
            const index = speciesOptions.value.findIndex(s => s.id === speciesForm.id)
            if (index !== -1) {
              speciesOptions.value[index] = savedSpecies
            }
            ElMessage.success('菌种更新成功')
          } else {
            // 添加菌种
            speciesOptions.value.push(savedSpecies)
            ElMessage.success('菌种添加成功')
          }
        } else {
          // 开发环境模拟保存
          if (speciesForm.id) {
            // 更新菌种
            const index = speciesOptions.value.findIndex(s => s.id === speciesForm.id)
            if (index !== -1) {
              speciesOptions.value[index] = { ...speciesForm }
            }
            ElMessage.success('菌种更新成功')
          } else {
            // 添加菌种
            const newSpecies = {
              id: Date.now(),
              name: speciesForm.name,
              scientific_name: speciesForm.scientific_name,
              abbreviation: speciesForm.abbreviation,
              ncbi_txid: speciesForm.ncbi_txid,
              description: speciesForm.description,
              status: speciesForm.status
            }
            speciesOptions.value.push(newSpecies)
            ElMessage.success('菌种添加成功')
          }
        }

        // 同步到store
        syncSystemConfigToStore()
        speciesDialogVisible.value = false
      } catch (error) {
        console.error('保存菌种失败:', error)
        ElMessage.error('保存菌种失败: ' + error.message)
      } finally {
        saveLoading.value = false
      }
    }

    const deleteSpecies = (species) => {
      ElMessageBox.confirm('确定要删除该菌种吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = speciesOptions.value.findIndex(s => s.id === species.id)
        if (index !== -1) {
          speciesOptions.value.splice(index, 1)
        }
        ElMessage.success('菌种删除成功')
      }).catch(() => {})
    }

    const toggleSpeciesStatus = (species) => {
      species.status = species.status === 'active' ? 'inactive' : 'active'
      ElMessage.success(`菌种已${species.status === 'active' ? '启用' : '禁用'}`)
    }

    // 地区管理方法
    const addRegion = () => {
      Object.assign(regionForm, { id: null, name: '', code: '', level: 'province', status: 'active' })
      regionDialogVisible.value = true
    }

    const editRegion = (region) => {
      Object.assign(regionForm, region)
      regionDialogVisible.value = true
    }

    const saveRegion = async () => {
      try {
        if (window.electronAPI && window.electronAPI.systemConfig) {
          // 使用后端API保存地区配置
          const savedRegion = await window.electronAPI.systemConfig.saveRegion(regionForm)

          if (regionForm.id) {
            // 更新地区
            const index = regionOptions.value.findIndex(r => r.id === regionForm.id)
            if (index !== -1) {
              regionOptions.value[index] = savedRegion
            }
            ElMessage.success('地区更新成功')
          } else {
            // 添加地区
            regionOptions.value.push(savedRegion)
            ElMessage.success('地区添加成功')
          }
        } else {
          // 开发环境模拟保存
          if (regionForm.id) {
            // 更新地区
            const index = regionOptions.value.findIndex(r => r.id === regionForm.id)
            if (index !== -1) {
              regionOptions.value[index] = { ...regionForm }
            }
            ElMessage.success('地区更新成功')
          } else {
            // 添加地区
            const newRegion = {
              id: Date.now(),
              name: regionForm.name,
              code: regionForm.code,
              level: regionForm.level,
              status: regionForm.status
            }
            regionOptions.value.push(newRegion)
            ElMessage.success('地区添加成功')
          }
        }
        syncSystemConfigToStore()
        regionDialogVisible.value = false
      } catch (error) {
        console.error('保存地区失败:', error)
        ElMessage.error('保存地区失败: ' + error.message)
      }
    }

    const deleteRegion = (region) => {
      ElMessageBox.confirm('确定要删除该地区吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = regionOptions.value.findIndex(r => r.id === region.id)
        if (index !== -1) {
          regionOptions.value.splice(index, 1)
        }
        ElMessage.success('地区删除成功')
      }).catch(() => {})
    }

    const toggleRegionStatus = (region) => {
      region.status = region.status === 'active' ? 'inactive' : 'active'
      ElMessage.success(`地区已${region.status === 'active' ? '启用' : '禁用'}`)
    }

    // 样本来源管理方法
    const addSource = () => {
      Object.assign(sourceForm, { id: null, name: '', category: 'clinical', description: '', status: 'active' })
      sourceDialogVisible.value = true
    }

    const editSource = (source) => {
      Object.assign(sourceForm, source)
      sourceDialogVisible.value = true
    }

    const saveSource = async () => {
      try {
        if (window.electronAPI && window.electronAPI.systemConfig) {
          // 使用后端API保存样本来源配置
          const savedSource = await window.electronAPI.systemConfig.saveSampleSource(sourceForm)

          if (sourceForm.id) {
            // 更新样本来源
            const index = sourceOptions.value.findIndex(s => s.id === sourceForm.id)
            if (index !== -1) {
              sourceOptions.value[index] = savedSource
            }
            ElMessage.success('样本来源更新成功')
          } else {
            // 添加样本来源
            sourceOptions.value.push(savedSource)
            ElMessage.success('样本来源添加成功')
          }
        } else {
          // 开发环境模拟保存
          if (sourceForm.id) {
            // 更新样本来源
            const index = sourceOptions.value.findIndex(s => s.id === sourceForm.id)
            if (index !== -1) {
              sourceOptions.value[index] = { ...sourceForm }
            }
            ElMessage.success('样本来源更新成功')
          } else {
            // 添加样本来源
            const newSource = {
              id: Date.now(),
              name: sourceForm.name,
              category: sourceForm.category,
              description: sourceForm.description,
              status: sourceForm.status
            }
            sourceOptions.value.push(newSource)
            ElMessage.success('样本来源添加成功')
          }
        }
        syncSystemConfigToStore()
        sourceDialogVisible.value = false
      } catch (error) {
        console.error('保存样本来源失败:', error)
        ElMessage.error('保存样本来源失败: ' + error.message)
      }
    }

    const deleteSource = (source) => {
      ElMessageBox.confirm('确定要删除该样本来源吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = sourceOptions.value.findIndex(s => s.id === source.id)
        if (index !== -1) {
          sourceOptions.value.splice(index, 1)
        }
        ElMessage.success('样本来源删除成功')
      }).catch(() => {})
    }

    const toggleSourceStatus = (source) => {
      source.status = source.status === 'active' ? 'inactive' : 'active'
      ElMessage.success(`样本来源已${source.status === 'active' ? '启用' : '禁用'}`)
      syncSystemConfigToStore()
    }

    // 同步系统配置到store
    const syncSystemConfigToStore = () => {
      const systemConfig = {
        species: speciesOptions.value.map(item => ({
          id: item.id,
          value: item.name,
          label: item.name,
          scientific_name: item.scientific_name,
          description: item.description,
          status: item.status
        })),
        regions: regionOptions.value.map(item => ({
          id: item.id,
          value: item.name,
          label: item.name,
          code: item.code,
          level: item.level,
          status: item.status
        })),
        sources: sourceOptions.value.map(item => ({
          id: item.id,
          value: item.name,
          label: item.name,
          category: item.category,
          description: item.description,
          status: item.status
        }))
      }

      store.commit('SET_SYSTEM_CONFIG', systemConfig)
    }

    // 实验管理方法
    const addExperiment = () => {
      Object.assign(experimentForm, { id: null, name: '', description: '', protocol: '', status: 'active' })
      experimentDialogVisible.value = true
    }

    const editExperiment = (experiment) => {
      Object.assign(experimentForm, experiment)
      experimentDialogVisible.value = true
    }

    const saveExperiment = () => {
      if (experimentForm.id) {
        // 更新实验类型
        const index = experimentTypes.value.findIndex(e => e.id === experimentForm.id)
        if (index !== -1) {
          experimentTypes.value[index] = { ...experimentForm }
        }
        ElMessage.success('实验类型更新成功')
      } else {
        // 添加实验类型
        const newExperiment = {
          id: Date.now(),
          name: experimentForm.name,
          description: experimentForm.description,
          protocol: experimentForm.protocol,
          status: experimentForm.status
        }
        experimentTypes.value.push(newExperiment)
        ElMessage.success('实验类型添加成功')
      }
      experimentDialogVisible.value = false
    }

    const deleteExperiment = (experiment) => {
      ElMessageBox.confirm('确定要删除该实验类型吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = experimentTypes.value.findIndex(e => e.id === experiment.id)
        if (index !== -1) {
          experimentTypes.value.splice(index, 1)
        }
        ElMessage.success('实验类型删除成功')
      }).catch(() => {})
    }

    const toggleExperimentStatus = (experiment) => {
      experiment.status = experiment.status === 'active' ? 'inactive' : 'active'
      ElMessage.success(`实验类型已${experiment.status === 'active' ? '启用' : '禁用'}`)
    }

    // 设置保存方法
    const saveBasicSettings = () => {
      ElMessage.success('基本设置保存成功')
    }

    const testDatabaseConnection = () => {
      ElMessage.success('数据库连接测试成功')
    }

    const saveDatabaseSettings = () => {
      ElMessage.success('数据库设置保存成功')
    }

    // 路径设置相关方法
    const selectGenomesPath = async () => {
      try {
        if (window.electronAPI && window.electronAPI.showOpenDialog) {
          const result = await window.electronAPI.showOpenDialog({
            properties: ['openDirectory'],
            title: '选择基因组数据保存路径'
          })
          if (!result.canceled && result.filePaths.length > 0) {
            pathForm.genomesPath = result.filePaths[0]
          }
        } else {
          ElMessage.warning('此功能仅在Electron环境下可用')
        }
      } catch (error) {
        ElMessage.error('选择路径失败: ' + error.message)
      }
    }

    const selectDatabasePath = async () => {
      try {
        if (window.electronAPI && window.electronAPI.showSaveDialog) {
          const result = await window.electronAPI.showSaveDialog({
            title: '选择SQLite数据库文件路径',
            defaultPath: 'pams.db',
            filters: [
              { name: 'SQLite数据库', extensions: ['db', 'sqlite', 'sqlite3'] },
              { name: '所有文件', extensions: ['*'] }
            ]
          })
          if (!result.canceled && result.filePath) {
            pathForm.databasePath = result.filePath
          }
        } else {
          ElMessage.warning('此功能仅在Electron环境下可用')
        }
      } catch (error) {
        ElMessage.error('选择路径失败: ' + error.message)
      }
    }

    const selectAnalysisPath = async () => {
      try {
        if (window.electronAPI && window.electronAPI.showOpenDialog) {
          const result = await window.electronAPI.showOpenDialog({
            properties: ['openDirectory'],
            title: '选择分析结果保存路径'
          })
          if (!result.canceled && result.filePaths.length > 0) {
            pathForm.analysisPath = result.filePaths[0]
          }
        } else {
          ElMessage.warning('此功能仅在Electron环境下可用')
        }
      } catch (error) {
        ElMessage.error('选择路径失败: ' + error.message)
      }
    }

    const selectTempPath = async () => {
      try {
        if (window.electronAPI && window.electronAPI.showOpenDialog) {
          const result = await window.electronAPI.showOpenDialog({
            properties: ['openDirectory'],
            title: '选择临时文件路径'
          })
          if (!result.canceled && result.filePaths.length > 0) {
            pathForm.tempPath = result.filePaths[0]
          }
        } else {
          ElMessage.warning('此功能仅在Electron环境下可用')
        }
      } catch (error) {
        ElMessage.error('选择路径失败: ' + error.message)
      }
    }

    const savePathSettings = async () => {
      try {
        // 这里可以调用Electron API保存路径设置
        if (window.electronAPI && window.electronAPI.systemConfig) {
          await window.electronAPI.systemConfig.savePathSettings(pathForm)
        } else {
          // 开发环境保存到localStorage
          localStorage.setItem('pams_path_settings', JSON.stringify(pathForm))
        }
        ElMessage.success('路径设置保存成功')
      } catch (error) {
        ElMessage.error('保存路径设置失败: ' + error.message)
      }
    }

    const resetPathSettings = () => {
      pathForm.genomesPath = ''
      pathForm.databasePath = ''
      pathForm.analysisPath = ''
      pathForm.tempPath = ''
      ElMessage.success('路径设置已重置')
    }

    const loadPathSettings = () => {
      try {
        const savedSettings = localStorage.getItem('pams_path_settings')
        if (savedSettings) {
          const settings = JSON.parse(savedSettings)
          Object.assign(pathForm, settings)
        }
      } catch (error) {
        console.error('加载路径设置失败:', error)
      }
    }

    // 页面加载时获取用户列表
    onMounted(async () => {
      // 处理ResizeObserver错误
      const handleResizeObserverError = () => {
        // 延迟执行，确保DOM已经渲染
        nextTick(() => {
          // 强制重新计算表格布局
          const tables = document.querySelectorAll('.el-table')
          tables.forEach(table => {
            if (table.__vue__) {
              table.__vue__.doLayout()
            }
          })
        })
      }

      // 监听标签页切换
      watch(experimentTab, () => {
        handleResizeObserverError()
      })
      watch(systemTab, () => {
        handleResizeObserverError()
      })

      // 加载用户数据
      loadUsers()

      try {
        // 优先从后端加载配置数据
        await loadConfigFromBackend()

        // 加载系统配置到store
        await store.dispatch('fetchSystemConfig')
        // 从store加载配置，如果有数据则覆盖默认数据
        loadSystemConfigFromStore()
      } catch (error) {
        console.error('加载系统配置失败:', error)
        // 如果加载失败，保持使用默认数据
      }

      // 加载路径设置
      loadPathSettings()
    })

    // 捕获ResizeObserver错误
    onErrorCaptured((err) => {
      if (err.message && err.message.includes('ResizeObserver')) {
        // 忽略ResizeObserver错误，这是Element Plus的已知问题
        return false
      }
      return true
    })

    // 从后端加载配置数据
    const loadConfigFromBackend = async () => {
      try {
        if (window.electronAPI && window.electronAPI.systemConfig) {
          // 加载菌种配置
          const species = await window.electronAPI.systemConfig.getSpecies()
          speciesOptions.value = species || []

          // 加载地区配置
          const regions = await window.electronAPI.systemConfig.getRegions()
          regionOptions.value = regions || []

          // 加载样本来源配置
          const sources = await window.electronAPI.systemConfig.getSampleSources()
          sourceOptions.value = sources || []
        }
      } catch (error) {
        console.error('加载配置数据失败:', error)
        ElMessage.error('加载配置数据失败')
      }
    }

    // 从store加载系统配置
    const loadSystemConfigFromStore = () => {
      const config = store.state.systemConfig

      // 更新菌种选项
      if (config.species && config.species.length > 0) {
        speciesOptions.value = config.species.map(item => ({
          id: item.id,
          name: item.value,
          scientific_name: item.scientific_name || '',
          description: item.description || '',
          status: item.status
        }))
      }

      // 更新地区选项
      if (config.regions && config.regions.length > 0) {
        regionOptions.value = config.regions.map(item => ({
          id: item.id,
          name: item.value,
          code: item.code || '',
          level: item.level || 'province',
          status: item.status
        }))
      }

      // 更新样本来源选项
      if (config.sources && config.sources.length > 0) {
        sourceOptions.value = config.sources.map(item => ({
          id: item.id,
          name: item.value,
          category: item.category || 'clinical',
          description: item.description || '',
          status: item.status
        }))
      }
    }

    return {
      experimentTab,
      systemTab,
      users,
      userDialogVisible,
      userForm,
      speciesOptions,
      speciesDialogVisible,
      speciesForm,
      ncbiLoading,
      abbreviationLoading,
      saveLoading,
      ncbiSearchResult,
      experimentTypes,
      experimentDialogVisible,
      experimentForm,
      basicForm,
      databaseForm,
      getRoleLabel,
      addUser,
      editUser,
      saveUser,
      deleteUser,
      refreshUsers,
      loadUsers,
      addSpecies,
      editSpecies,
      saveSpecies,
      deleteSpecies,
      toggleSpeciesStatus,
      generateAbbreviation,
      searchNCBITaxonomy,
      onScientificNameChange,
      // 地区管理
      regionOptions,
      regionDialogVisible,
      regionForm,
      addRegion,
      editRegion,
      saveRegion,
      deleteRegion,
      toggleRegionStatus,
      // 样本来源管理
      sourceOptions,
      sourceDialogVisible,
      sourceForm,
      addSource,
      editSource,
      saveSource,
      deleteSource,
      toggleSourceStatus,
      addExperiment,
      editExperiment,
      saveExperiment,
      deleteExperiment,
      toggleExperimentStatus,
      saveBasicSettings,
      testDatabaseConnection,
      saveDatabaseSettings,
      // 路径设置
      pathForm,
      selectGenomesPath,
      selectDatabasePath,
      selectAnalysisPath,
      selectTempPath,
      savePathSettings,
      resetPathSettings
    }
  }
}
</script>

<style lang="scss" scoped>
.system-settings-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 30px;

  h1 {
    margin: 0 0 10px 0;
    font-size: 28px;
    color: #303133;
  }

  p {
    margin: 0;
    color: #909399;
    font-size: 14px;
  }
}

.content-area {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.settings-section {
  margin-bottom: 30px;
  background: #fafafa;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e4e7ed;
}

.section-header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #409eff;
}

.section-header h2 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #303133;
  font-weight: 600;
}

.section-header p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.experiment-tabs,
.system-tabs {
  background: white;
  border-radius: 6px;
  padding: 15px;
}

.toolbar {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.toolbar .el-button {
  margin-right: 10px;
}

.user-management,
.species-management,
.region-management,
.source-management,
.experiment-management {
  .el-table {
    margin-top: 20px;
  }
}

.el-dialog {
  .el-form {
    padding: 20px;
  }
}

// 学名斜体样式
em {
  font-style: italic;
  color: #606266;
}

// 表单帮助文本样式
.form-help {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.4;
}
</style>
