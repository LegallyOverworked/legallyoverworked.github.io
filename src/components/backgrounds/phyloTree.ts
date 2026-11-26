import { TAU, clamp, dot, ease, flanks, hash, line, rgbStr, ring, rng, strandA, strandB } from './draw';
import type { Scene } from './types';

interface TreeNode {
  leaves: number;
  kids: TreeNode[];
  first: number;
  last: number;
  angle: number;
  radius: number;
  support: number;
  clade: number;
  leaf: number;
}

function buildTree(leafCount: number, r: () => number) {
  let nextLeaf = 0;
  const nodes: TreeNode[] = [];
  const grow = (leaves: number, depth: number): TreeNode => {
    const node: TreeNode = { leaves, kids: [], first: 0, last: 0, angle: 0, radius: 0, support: 0, clade: -1, leaf: -1 };
    nodes.push(node);
    if (leaves === 1) {
      node.leaf = nextLeaf;
      nextLeaf += 1;
      node.first = node.last = node.angle = node.leaf;
      node.radius = 0.8 + 0.2 * r();
      return node;
    }
    const split = Math.max(1, Math.min(leaves - 1, Math.round(leaves * (0.3 + 0.4 * r()))));
    const a = grow(split, depth + 1);
    const b = grow(leaves - split, depth + 1);
    node.kids = [a, b];
    node.first = a.first;
    node.last = b.last;
    node.angle = (a.angle + b.angle) / 2;
    node.support = 0.3 + 0.7 * r();
    node.radius = depth === 0 ? 0 : Math.max(0.1, 0.92 - 0.82 * Math.pow((leaves - 1) / (leafCount - 1), 0.5));
    return node;
  };
  const root = grow(leafCount, 0);
  const pushOut = (node: TreeNode) => {
    for (const kid of node.kids) {
      if (kid.radius < node.radius + 0.07) kid.radius = Math.min(kid.leaves === 1 ? 1 : 0.9, node.radius + 0.07 + 0.04 * r());
      pushOut(kid);
    }
  };
  pushOut(root);
  const clades: [number, number][] = [];
  const divide = (node: TreeNode) => {
    if (node.leaves <= Math.ceil(leafCount / 3.4)) {
      clades.push([node.first, node.last]);
      return;
    }
    node.kids.forEach(divide);
  };
  divide(root);
  for (const node of nodes) {
    clades.forEach(([first, last], ci) => {
      if (node.first >= first && node.last <= last) node.clade = ci;
    });
  }
  return { nodes, leafCount, clades, highlightable: nodes.filter((n) => n.leaves >= 3 && n.leaves <= 7) };
}

const TREES = (() => {
  const r = rng(47);
  return [buildTree(26, r), buildTree(22, r)];
})();

const CYCLE = 8;
const SWEEP = TAU * 0.93;

export const phyloTree: Scene = {
  still: 6,
  draw(ctx, w, h, t, pal, dead) {
    const cy = h / 2;
    const epoch = Math.floor(t / CYCLE);
    const tt = t - epoch * CYCLE;
    const accent = rgbStr(pal.accent);
    const ink = rgbStr(pal.ink);
    const fade = 1 - ease((tt - (CYCLE - 0.6)) / 0.6);
    const grown = ease(clamp((tt - 0.2) / 3.6));
    const labels = ease((tt - 3.2) / 0.8) * fade;
    const highlight = ease((tt - 4.3) / 0.6) * fade;

    flanks(w, dead).forEach(([x0, x1], side) => {
      const tree = TREES[side];
      const cx = (x0 + x1) / 2;
      const R = Math.max(1, Math.min(h * 0.26, (x1 - x0) * 0.37));
      const turn = t * 0.05 * (side ? -1 : 1) + side * 1.7;
      const angle = (leafIndex: number) => turn + ((leafIndex + 0.5) / tree.leafCount) * SWEEP;
      const at = (radius: number, a: number): [number, number] => [cx + Math.cos(a) * radius * R, cy + Math.sin(a) * radius * R];
      const trunk = strandA(pal, cx / w);
      const cladeColours = [trunk, accent, strandB(pal, cx / w), ink];
      const colourOf = (node: TreeNode) => (node.clade < 0 ? trunk : cladeColours[node.clade % cladeColours.length]);
      const picked = tree.highlightable[Math.floor(hash(epoch, side, 3) * tree.highlightable.length)];
      const inPicked = (node: TreeNode) => highlight > 0 && node.first >= picked.first && node.last <= picked.last;

      if (highlight > 0) {
        ctx.fillStyle = `rgba(${accent},${0.1 * highlight})`;
        ctx.beginPath();
        ctx.arc(cx, cy, R * 1.19, angle(picked.first - 0.5), angle(picked.last + 0.5));
        ctx.arc(cx, cy, picked.radius * R, angle(picked.last + 0.5), angle(picked.first - 0.5), true);
        ctx.closePath();
        ctx.fill();
      }

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, Math.max(0.5, R * 1.01 * grown), 0, TAU);
      ctx.clip();
      for (const node of tree.nodes) {
        if (!node.kids.length) continue;
        ctx.strokeStyle = `rgba(${colourOf(node)},${(node.clade < 0 ? 0.45 : 0.75) * fade})`;
        ctx.lineWidth = inPicked(node) ? 1.2 + 0.9 * highlight : 1.2;
        ctx.beginPath();
        ctx.arc(cx, cy, Math.max(0.5, node.radius * R), angle(node.kids[0].angle), angle(node.kids[1].angle));
        ctx.stroke();
        for (const kid of node.kids) {
          const a = angle(kid.angle);
          const p1 = at(node.radius, a);
          const p2 = at(kid.radius, a);
          line(ctx, p1[0], p1[1], p2[0], p2[1], colourOf(kid), (kid.clade < 0 ? 0.45 : 0.75) * fade, inPicked(kid) ? 1.2 + 0.9 * highlight : 1.2);
        }
      }
      for (const node of tree.nodes) {
        if (!node.kids.length) continue;
        const p = at(node.radius, angle(node.angle));
        dot(ctx, p[0], p[1], 1 + 1.6 * node.support, colourOf(node), 0.85 * fade);
      }
      ctx.restore();

      if (labels > 0) {
        for (const node of tree.nodes) {
          if (node.kids.length) continue;
          const a = angle(node.angle);
          const rgb = colourOf(node);
          const tip = at(node.radius, a);
          const rim = at(1, a);
          const l1 = at(1.05, a);
          const l2 = at(1.08 + 0.1 * hash(node.leaf, side, 8), a);
          ctx.setLineDash([1, 3]);
          line(ctx, tip[0], tip[1], rim[0], rim[1], rgb, 0.4 * labels);
          ctx.setLineDash([]);
          dot(ctx, tip[0], tip[1], 2.2, rgb, 0.9 * labels);
          line(ctx, l1[0], l1[1], l2[0], l2[1], rgb, 0.6 * labels, 2);
        }
        tree.clades.forEach(([first, last], ci) => {
          ctx.strokeStyle = `rgba(${cladeColours[ci % cladeColours.length]},${0.7 * labels})`;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(cx, cy, R * 1.24, angle(first - 0.35), angle(last + 0.35));
          ctx.stroke();
        });
      }

      dot(ctx, cx, cy, 3, ink, 0.9 * fade);
      if (highlight > 0) {
        const p = at(picked.radius, angle(picked.angle));
        dot(ctx, p[0], p[1], 3.2, accent, highlight);
        const pulse = clamp((tt - 4.3) / 0.9);
        if (pulse < 1) ring(ctx, p[0], p[1], 4 + 12 * pulse, accent, 0.6 * (1 - pulse), 1.2);
      }
    });
  },
};
