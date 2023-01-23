# 成语消消乐

<img width="1440" alt="image" src="https://user-images.githubusercontent.com/33208530/214014531-19b63fdb-5736-466b-9f46-24b20fd29c43.png">


仿造前段时间网易的《英雄三国》做的游戏。

游戏的谜题生成是最复杂的部分：
1. 需要随即使用不同长度的短语恰好填满整个棋盘。
2. 需要保证用户无论如何消除也要让游戏有解。

## 解决
> **Note**
> 粗陋的算法还有很大问题，只能通过无限测试是否满足条件的工程方法解决。

1. 首先在数目上满足 $n*n$ 的方块数量，这个使用随机 dfs 就可以做到。（但是在测试过程中发现，有的数字组合好像是永远无解的）。
2. 每次在新生成的棋盘上使用随机 dfs 可以得到一条随机变化的长线。
3. 为了保证有解写了一堆条件检查。

## 感谢
1. 字体: https://github.com/lxgw/LxgwWenKai
2. 数据: http://thuocl.thunlp.org/

# Vue 3 + Vite

This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).
