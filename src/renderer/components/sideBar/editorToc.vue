<template>
  <div
    class="editor-side-toc"
    :class="[{ 'editor-toc-overflow': !wordWrapInToc, 'editor-toc-wordwrap': wordWrapInToc }]"
  >
    <div class="toc-title">目录</div>
    <el-tree
      v-if="toc.length"
      :data="toc"
      :default-expand-all="true"
      :props="defaultProps"
      @node-click="handleClick"
      :expand-on-click-node="false"
      :indent="8"
    ></el-tree>
    <div class="no-data" v-else>
      <svg aria-hidden="true" :viewBox="EmptyIcon.viewBox">
        <use :xlink:href="EmptyIcon.url"></use>
      </svg>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import bus from '../../bus'
import EmptyIcon from '@/assets/icons/undraw_toc_empty.svg'

export default {
  data () {
    this.EmptyIcon = EmptyIcon
    return {
      defaultProps: {
        children: 'children',
        label: 'label'
      }
    }
  },
  computed: {
    ...mapState({
      toc: state => state.editor.toc,
      wordWrapInToc: state => state.preferences.wordWrapInToc
    })
  },
  methods: {
    handleClick ({ slug }) {
      bus.$emit('scroll-to-header', slug)
    }
  }
}
</script>

<style>
  .editor-side-toc {
    height: 100%;
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    background: var(--editorBgColor);
    border-right: 1px solid var(--itemBgColor);
    overflow: hidden;
    flex-shrink: 0;
    width: 200px;
    min-width: 150px;
  }
  .editor-side-toc .toc-title {
    color: var(--editorColor);
    font-weight: 600;
    font-size: 13px;
    margin: 0;
    padding: 10px 12px;
    border-bottom: 1px solid var(--itemBgColor);
    user-select: none;
    opacity: 0.7;
  }
  .editor-side-toc .el-tree-node {
    margin-top: 2px;
  }
  .editor-side-toc .el-tree {
    background: transparent;
    color: var(--editorColor);
    font-size: 13px;
  }
  .editor-side-toc .el-tree-node:focus > .el-tree-node__content {
    background-color: var(--floatBorderColor);
  }
  .editor-side-toc .el-tree-node__content:hover {
    background: var(--floatBorderColor);
  }
  .editor-side-toc .el-tree-node__content {
    height: auto;
    min-height: 24px;
    line-height: 20px;
    padding-left: 0 !important;
  }
  .editor-side-toc > li {
    font-size: 13px;
    margin-bottom: 6px;
    cursor: pointer;
  }
  .editor-side-toc .no-data {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-around;
    & svg {
      width: 80px;
      fill: var(--iconColor);
      opacity: 0.3;
    }
  }
  .editor-toc-overflow {
    overflow: auto;
    &::-webkit-scrollbar:vertical {
      width: 8px;
    }
    &::-webkit-scrollbar:horizontal {
      height: 8px;
    }
  }
  .editor-toc-wordwrap {
    overflow-x: hidden;
    overflow-y: auto;
    &::-webkit-scrollbar:vertical {
      width: 8px;
    }
    & .el-tree-node__content {
      white-space: normal;
      height: auto;
      min-height: 22px;
    }
  }
</style>
