import { useRef } from 'react';
import { InteractiveNvlWrapper } from '@neo4j-nvl/react';
import NVL, { NvlOptions } from '@neo4j-nvl/core';


export default function MyGraph(props: any) {

    const nvlRef = useRef<NVL>(null);

    // We always have one product
    const productNode = {
        id: `0`,
        size: 30,
        caption: props.name,
        color: "blue"
    };

    // Find a distinct set of customers
    const customerSet = [...new Set(props.data.map((row) => row.customer))];
    const customerNodes = customerSet.map((customer, index) => {
        return {
            id: `${index + 1}`,
            size: 20,
            caption: `${customer}`,
            color: "darkgreen"
        };
    });

    const nodes = [productNode, ...customerNodes];

    // Create relationships from product to customers
    const relationships = props.data.map((row, index) => {
        return {
            id: `${index}`,
            caption: `${row.quantity}`,
            from: `0`,
            to: `${customerSet.indexOf(row.customer) + 1}`
        };
    });

    const mouseEventCallbacks = {
        onPan: true,
        onZoom: true,
        onDrag: true,
    };

    const nvlOptions: NvlOptions = {
        allowDynamicMinZoom: false,
        disableWebGL: true,
        maxZoom: 2,
        minZoom: 0.05,
        relationshipThreshold: 0.55,
        selectionBehaviour: 'single',
        useWebGL: false,
        instanceId: 'inspect-graph',
    };

    return (
        <>
            <div style={{ width: '100%', height: '600px' }}>
                <InteractiveNvlWrapper
                    ref={nvlRef}
                    nodes={nodes}
                    rels={relationships}
                    nvlOptions={nvlOptions}
                    mouseEventCallbacks={{ ...mouseEventCallbacks }} />
            </div>
        </>
    );
}
