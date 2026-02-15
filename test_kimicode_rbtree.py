#!/usr/bin/env python3
"""
红黑树实现 - 由KimiCode生成
测试KimiCode模型的代码能力
"""

from typing import Optional, List


class Color:
    RED = 0
    BLACK = 1


class TreeNode:
    """红黑树节点"""
    def __init__(self, key: int, color: int = Color.RED):
        self.key = key
        self.color = color
        self.left: Optional[TreeNode] = None
        self.right: Optional[TreeNode] = None
        self.parent: Optional[TreeNode] = None


class RedBlackTree:
    """
    红黑树实现
    特性：
    1. 节点是红色或黑色
    2. 根节点是黑色
    3. 所有叶子(NIL)是黑色
    4. 红色节点的子节点必须是黑色
    5. 从任一节点到其每个叶子的路径包含相同数目的黑色节点
    """
    
    def __init__(self):
        self.NIL = TreeNode(0, Color.BLACK)  # 哨兵节点
        self.root: TreeNode = self.NIL
    
    def _left_rotate(self, x: TreeNode) -> None:
        """左旋"""
        y = x.right
        x.right = y.left
        if y.left != self.NIL:
            y.left.parent = x
        y.parent = x.parent
        if x.parent == self.NIL:
            self.root = y
        elif x == x.parent.left:
            x.parent.left = y
        else:
            x.parent.right = y
        y.left = x
        x.parent = y
    
    def _right_rotate(self, y: TreeNode) -> None:
        """右旋"""
        x = y.left
        y.left = x.right
        if x.right != self.NIL:
            x.right.parent = y
        x.parent = y.parent
        if y.parent == self.NIL:
            self.root = x
        elif y == y.parent.right:
            y.parent.right = x
        else:
            y.parent.left = x
        x.right = y
        y.parent = x
    
    def _insert_fixup(self, z: TreeNode) -> None:
        """插入修复"""
        while z.parent.color == Color.RED:
            if z.parent == z.parent.parent.left:
                y = z.parent.parent.right
                if y.color == Color.RED:
                    z.parent.color = Color.BLACK
                    y.color = Color.BLACK
                    z.parent.parent.color = Color.RED
                    z = z.parent.parent
                else:
                    if z == z.parent.right:
                        z = z.parent
                        self._left_rotate(z)
                    z.parent.color = Color.BLACK
                    z.parent.parent.color = Color.RED
                    self._right_rotate(z.parent.parent)
            else:
                y = z.parent.parent.left
                if y.color == Color.RED:
                    z.parent.color = Color.BLACK
                    y.color = Color.BLACK
                    z.parent.parent.color = Color.RED
                    z = z.parent.parent
                else:
                    if z == z.parent.left:
                        z = z.parent
                        self._right_rotate(z)
                    z.parent.color = Color.BLACK
                    z.parent.parent.color = Color.RED
                    self._left_rotate(z.parent.parent)
        self.root.color = Color.BLACK
    
    def insert(self, key: int) -> None:
        """插入节点 O(logn)"""
        z = TreeNode(key)
        z.left = self.NIL
        z.right = self.NIL
        
        y = self.NIL
        x = self.root
        
        while x != self.NIL:
            y = x
            if z.key < x.key:
                x = x.left
            else:
                x = x.right
        
        z.parent = y
        if y == self.NIL:
            self.root = z
        elif z.key < y.key:
            y.left = z
        else:
            y.right = z
        
        self._insert_fixup(z)
    
    def _inorder_helper(self, node: TreeNode, result: List[int]) -> None:
        """中序遍历辅助"""
        if node != self.NIL:
            self._inorder_helper(node.left, result)
            result.append(node.key)
            self._inorder_helper(node.right, result)
    
    def inorder(self) -> List[int]:
        """中序遍历 - 返回有序数组"""
        result = []
        self._inorder_helper(self.root, result)
        return result
    
    def _get_height(self, node: TreeNode) -> int:
        """获取树高"""
        if node == self.NIL:
            return 0
        return 1 + max(self._get_height(node.left), self._get_height(node.right))
    
    def height(self) -> int:
        """获取红黑树高度"""
        return self._get_height(self.root)
    
    def _count_black_height(self, node: TreeNode) -> int:
        """计算黑色高度"""
        if node == self.NIL:
            return 0
        left_bh = self._count_black_height(node.left)
        right_bh = self._count_black_height(node.right)
        assert left_bh == right_bh, "红黑树性质被破坏！"
        return left_bh + (1 if node.color == Color.BLACK else 0)
    
    def validate(self) -> bool:
        """验证红黑树性质"""
        if self.root == self.NIL:
            return True
        if self.root.color != Color.BLACK:
            print("错误：根节点不是黑色！")
            return False
        try:
            self._count_black_height(self.root)
            return True
        except AssertionError as e:
            print(f"错误：{e}")
            return False


def test_red_black_tree():
    """测试红黑树"""
    print("=" * 50)
    print("红黑树测试 - KimiCode")
    print("=" * 50)
    
    rbt = RedBlackTree()
    
    # 插入测试数据
    test_values = [50, 30, 70, 20, 40, 60, 80, 10, 25, 35, 45]
    print(f"\n插入数据: {test_values}")
    
    for val in test_values:
        rbt.insert(val)
    
    # 验证红黑树性质
    print(f"\n红黑树性质验证: {'通过 ✓' if rbt.validate() else '失败 ✗'}")
    
    # 中序遍历结果
    inorder_result = rbt.inorder()
    print(f"中序遍历结果: {inorder_result}")
    
    # 验证排序正确性
    is_sorted = all(inorder_result[i] <= inorder_result[i+1] 
                    for i in range(len(inorder_result)-1))
    print(f"排序正确性: {'通过 ✓' if is_sorted else '失败 ✗'}")
    
    # 树高度
    print(f"树高度: {rbt.height()}")
    print(f"数据量: {len(test_values)}")
    
    print("\n" + "=" * 50)
    print("✅ KimiCode 红黑树实现测试完成！")
    print("=" * 50)


if __name__ == "__main__":
    test_red_black_tree()
