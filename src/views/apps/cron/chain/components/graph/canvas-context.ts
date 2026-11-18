// 画布渲染上下文注入键：节点/边组件经 inject 读取 DSL、校验问题与运行叠加状态

import type { InjectionKey } from 'vue'
import type { CanvasContext } from '../../types/graph'

export const CANVAS_CONTEXT: InjectionKey<CanvasContext> = Symbol('chain-canvas-context')
