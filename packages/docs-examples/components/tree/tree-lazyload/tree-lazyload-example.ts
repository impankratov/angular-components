import { SelectionChange } from '@angular/cdk/collections';
import { ChangeDetectionStrategy, Component, Injectable } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqProgressSpinnerModule } from '@koobiq/components/progress-spinner';
import { FlatTreeControl, KbqTreeFlatDataSource, KbqTreeFlattener, KbqTreeModule } from '@koobiq/components/tree';
import { BehaviorSubject, Observable, timer } from 'rxjs';

interface INodeResponse {
    id: string;
    name: string;
    hasChildren: boolean;
}

class LazyLoadFlatNode {
    id: string;
    name: string;
    expandable: boolean;
    level: number;
    parent: LazyLoadFlatNode;
    loading: boolean;
}

class LazyLoadNode {
    childrenChange = new BehaviorSubject<LazyLoadNode[]>([]);

    get children(): LazyLoadNode[] {
        return this.childrenChange.value;
    }

    constructor(
        public id: string,
        public name: string,
        public hasChildren = false,
        public loading = false,
        public loaded: boolean = false
    ) {}
}

@Injectable()
export class LazyLoadDataService {
    dataChange = new BehaviorSubject<LazyLoadNode[]>([]);
    nodeMap = new Map<string, LazyLoadNode>();

    initialize(): void {
        // example with http-request
        /*this.http.get<INodeResponse[]>('/api/getTree').subscribe((data) => {
            this.dataChange.next(
                data.map((nodeResponse: INodeResponse) => {
                        const result = new LazyLoadNode(nodeResponse.id, nodeResponse.name, nodeResponse.hasChildren);
                        this.nodeMap.set(nodeResponse.id, result);

                        return result;
                    }
                )
            );
        });*/

        this.dataChange.next(
            Array(5)
                .fill({})
                .map((value, index) => {
                    const id = index.toString();

                    return {
                        ...value,
                        hasChildren: !(index % 2),
                        name: `node-${id}`,
                        id
                    };
                })
                .map((nodeResponse: INodeResponse) => {
                    const result = new LazyLoadNode(nodeResponse.id, nodeResponse.name, nodeResponse.hasChildren);

                    this.nodeMap.set(nodeResponse.id, result);

                    return result;
                })
        );
    }

    loadChildren(id: string): void {
        const parent = this.nodeMap.get(id)!;

        if (parent.loading || (parent.hasChildren && parent.children.length)) {
            return;
        }

        parent.loading = true;
        this.nodeMap.set(parent.id, parent);
        this.dataChange.next(this.dataChange.value);

        // example with http-request
        /* this.http.get<INodeResponse[]>(`/api/getChildren/${ id }`)
            .pipe(
                finalize(() => {
                    parent.loading = false;
                    this.nodeMap.set(parent.id, parent);
                    this.dataChange.next(this.dataChange.value);
                })
            )
            .subscribe((data) => {
                const children = data.map((nodeResponse: INodeResponse) => {
                        const result = new LazyLoadNode(nodeResponse.id, nodeResponse.name, nodeResponse.hasChildren);
                        this.nodeMap.set(nodeResponse.id, result);

                        return result;
                    }
                );
                parent.loaded = true;
                parent.childrenChange.next(children);
            });
        */

        timer(5000).subscribe(() => {
            parent.childrenChange.next(
                Array(5)
                    .fill({})
                    .map((value, index) => {
                        const childId = `${parent.id}-${index}`.toString();

                        return {
                            ...value,
                            hasChildren: !(index % 2),
                            name: `node-${childId}`,
                            id: childId
                        };
                    })
                    .map((nodeResponse: INodeResponse) => {
                        const result = new LazyLoadNode(nodeResponse.id, nodeResponse.name, nodeResponse.hasChildren);

                        this.nodeMap.set(nodeResponse.id, result);

                        return result;
                    })
            );
            parent.loading = false;
            parent.loaded = true;
            this.nodeMap.set(parent.id, parent);
            this.dataChange.next(this.dataChange.value);
        });
    }
}

class LazyLoadDataSource<T, F> extends KbqTreeFlatDataSource<T, F> {
    constructor(
        treeControl: FlatTreeControl<F>,
        treeFlattener: KbqTreeFlattener<T, F>,
        private dataService: LazyLoadDataService
    ) {
        super(treeControl, treeFlattener, []);
    }

    expansionHandler(change: SelectionChange<F>): F[] {
        if (change && (change as SelectionChange<F>).added && (change as SelectionChange<F>).added.length) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            this.dataService.loadChildren((change.added[0] as F).id);
        }

        return super.expansionHandler(change);
    }
}

/**
 * @title Tree lazyload
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'tree-lazyload-example',
    template: `
        <kbq-tree-selection [dataSource]="dataSource" [treeControl]="treeControl" [(ngModel)]="modelValue">
            <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding>
                <span [innerHTML]="treeControl.getViewValue(node)"></span>
            </kbq-tree-option>

            <kbq-tree-option *kbqTreeNodeDef="let node; when: hasChild" kbqTreeNodePadding>
                <kbq-tree-node-toggle [node]="node" />
                @if (node.loading) {
                    <kbq-progress-spinner mode="indeterminate" />
                }

                <span [innerHTML]="treeControl.getViewValue(node)"></span>
            </kbq-tree-option>
        </kbq-tree-selection>
    `,
    imports: [
        KbqTreeModule,
        FormsModule,
        KbqProgressSpinnerModule
    ],
    providers: [LazyLoadDataService]
})
export class TreeLazyloadExample {
    treeControl: FlatTreeControl<LazyLoadFlatNode>;
    treeFlattener: KbqTreeFlattener<LazyLoadNode, LazyLoadFlatNode>;

    dataSource: LazyLoadDataSource<LazyLoadNode, LazyLoadFlatNode>;

    modelValue: any = '';

    nodeMap = new Map<string, LazyLoadFlatNode>();

    constructor(private dataService: LazyLoadDataService) {
        this.treeFlattener = new KbqTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);

        this.treeControl = new FlatTreeControl<LazyLoadFlatNode>(
            this.getLevel,
            this.isExpandable,
            this.getValue,
            this.getViewValue
        );
        this.dataSource = new LazyLoadDataSource(this.treeControl, this.treeFlattener, this.dataService);

        this.dataSource.data = [];

        this.dataService.dataChange.subscribe((data: LazyLoadNode[]) => {
            this.dataSource.data = data;
        });

        this.dataService.initialize();
    }

    hasChild(_: number, nodeData: LazyLoadFlatNode): boolean {
        return nodeData.expandable;
    }

    clickNode(node: LazyLoadFlatNode): void {
        this.dataService.loadChildren(node.id);
    }

    private transformer = (node: LazyLoadNode, level: number, parent: any): LazyLoadFlatNode => {
        const existingNode = this.nodeMap.get(node.id);

        const flatNode = new LazyLoadFlatNode();

        flatNode.id = node.id;
        flatNode.name = node.name;
        flatNode.parent = parent;
        flatNode.level = level;
        flatNode.expandable = node.hasChildren;
        flatNode.loading = node.loading;

        if (existingNode && existingNode.id === flatNode.id) {
            return existingNode;
        }

        this.nodeMap.set(node.id, flatNode);

        if (node.loaded) {
            this.treeControl.expand(flatNode);
        }

        return flatNode;
    };

    private getLevel = (node: LazyLoadFlatNode) => {
        return node.level;
    };

    private isExpandable = (node: LazyLoadFlatNode) => {
        return node.expandable;
    };

    private getChildren = (node: LazyLoadNode): Observable<LazyLoadNode[]> => {
        return node.childrenChange;
    };

    private getValue = (node: LazyLoadFlatNode): string => {
        return node.name;
    };

    private getViewValue = (node: LazyLoadFlatNode): string => {
        return node.name;
    };
}
