<template>
  <div class="dropdown-input">
    <el-select
      v-model="selectedValue"
      :placeholder="placeholder"
      filterable
      allow-create
      default-first-option
      :reserve-keyword="false"
      :clearable="clearable"
      :disabled="disabled"
      :size="size"
      @change="handleChange"
      @clear="handleClear"
    >
      <el-option
        v-for="option in options"
        :key="option.value"
        :label="option.label"
        :value="option.value"
        :disabled="option.disabled"
      >
        <template v-if="option.description">
          <div class="option-item">
            <div class="option-label">{{ option.label }}</div>
            <div class="option-description">{{ option.description }}</div>
          </div>
        </template>
      </el-option>
    </el-select>
  </div>
</template>

<script>
import { ref, watch } from 'vue'

export default {
  name: 'DropdownInput',
  props: {
    modelValue: {
      type: [String, Number],
      default: ''
    },
    options: {
      type: Array,
      default: () => []
    },
    placeholder: {
      type: String,
      default: '请选择或输入'
    },
    clearable: {
      type: Boolean,
      default: true
    },
    disabled: {
      type: Boolean,
      default: false
    },
    size: {
      type: String,
      default: 'default',
      validator: (value) => ['large', 'default', 'small'].includes(value)
    }
  },
  emits: ['update:modelValue', 'change', 'clear'],
  setup (props, { emit }) {
    const selectedValue = ref(props.modelValue)

    // 监听外部值变化
    watch(() => props.modelValue, (newValue) => {
      selectedValue.value = newValue
    })

    // 监听内部值变化
    watch(selectedValue, (newValue) => {
      emit('update:modelValue', newValue)
    })

    const handleChange = (value) => {
      emit('change', value)
    }

    const handleClear = () => {
      emit('clear')
    }

    return {
      selectedValue,
      handleChange,
      handleClear
    }
  }
}
</script>

<style lang="scss" scoped>
.dropdown-input {
  width: 100%;

  .el-select {
    width: 100%;
  }

  .option-item {
    .option-label {
      font-weight: 500;
      color: #303133;
    }

    .option-description {
      font-size: 12px;
      color: #909399;
      margin-top: 2px;
    }
  }
}
</style>
