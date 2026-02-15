# 二叉搜索树实现 - 由KimiCode生成
# 测试KimiCode模型是否正常工作

class TreeNode:
    """二叉树节点"""
    def __init__(self, val=0):
        self.val = val
        self.left = None
        self.right = None

class BinarySearchTree:
    """二叉搜索树类"""
    
    def __init__(self):
        self.root = None
    
    def insert(self, val: int) -> None:
        """插入节点 O(logn)"""
        if not self.root:
            self.root = TreeNode(val)
            return
        self._insert_recursive(self.root, val)
    
    def _insert_recursive(self, node: TreeNode, val: int) -> None:
        if val < node.val:
            if node.left:
                self._insert_recursive(node.left, val)
            else:
                node.left = TreeNode(val)
        else:
            if node.right:
                self._insert_recursive(node.right, val)
            else:
                node.right = TreeNode(val)
    
    def search(self, val: int) -> bool:
        """搜索节点 O(logn)"""
        return self._search_recursive(self.root, val)
    
    def _search_recursive(self, node: TreeNode, val: int) -> bool:
        if not node:
            return False
        if val == node.val:
            return True
        if val < node.val:
            return self._search_recursive(node.left, val)
        return self._search_recursive(node.right, val)
    
    def inorder(self) -> list:
        """中序遍历 - 返回有序数组"""
        result = []
        self._inorder_recursive(self.root, result)
        return result
    
    def _inorder_recursive(self, node: TreeNode, result: list) -> None:
        if node:
            self._inorder_recursive(node.left, result)
            result.append(node.val)
            self._inorder_recursive(node.right, result)

# 测试代码
if __name__ == "__main__":
    bst = BinarySearchTree()
    
    # 插入数据
    values = [50, 30, 70, 20, 40, 60, 80]
    for v in values:
        bst.insert(v)
    
    print(f"中序遍历结果: {bst.inorder()}")
    print(f"搜索40: {bst.search(40)}")
    print(f"搜索100: {bst.search(100)}")
    print("\n✅ KimiCode 测试成功！")
