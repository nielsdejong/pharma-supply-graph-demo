

// MATCH p=(place1)-[:LOCATED_AT]-()-[:NEXT]->()-[:LOCATED_AT]-(place2) 
// MERGE (place1)-[d:DELIVERS_TO]->(place2)
// ON MATCH SET d.deliveries = d.deliveries+1
// ON CREATE SET d.deliveries = 1;

MATCH (a) WHERE a.latitude IS NOT NULL
SET a.point = point({latitude: a.latitude, longitude: a.longitude});

MATCH ()-[r:ROUTE_TO]-() DELETE r;

MATCH (a) WHERE a.point IS NOT NULL
MATCH (b) WHERE id(a) < id(b) AND b.point IS NOT NULL and point.distance(a.point, b.point) < 200000
CREATE (a)-[:ROUTE_TO{distance: point.distance(a.point, b.point)}]->(b);


MATCH (n:Headquarter)-[r:ROUTE_TO]-() DELETE r;


MATCH ()-[r:ROUTE]->() DELETE r;

CALL gds.graph.drop("graph");

CALL gds.graph.project(
  'graph',
  ['DistributionPoint'],
  {
    ROUTE_TO: { properties: "distance", orientation: "undirected" }
  }
)
YIELD
  graphName AS graph,
  relationshipProjection AS readProjection,
  nodeCount AS nodes,
  relationshipCount AS rels;

  
MATCH (n:DistributionPoint)
WITH n  LIMIT 1
CALL gds.spanningTree.write('graph', {
  sourceNode: n,
  relationshipTypes:["ROUTE_TO"],
  relationshipWeightProperty: 'distance',
  writeProperty: 'distance',
  writeRelationshipType: 'ROUTE'
})
YIELD preProcessingMillis, computeMillis, writeMillis, effectiveNodeCount
RETURN preProcessingMillis, computeMillis, writeMillis, effectiveNodeCount;

MATCH p=(d:DistributionPoint)
WHERE d.name = "Harry Warehouse"
DETACH DELETE d;


MATCH (f:Factory)
WHERE f.name ='Rordisk Factory North'
SET f.name =  "Nakskov Factory",
f.address = "Narvikvej 15, 4900 Nakskov, Denmark",
f.latitude = 54.826717, 
f.longitude = 11.170571,
f.point = point({latitude: 54.826717, longitude: 11.170571});

MATCH (a:DistributionPoint), (b:DistributionPoint)
WHERE a.name = "Arthur Warehouse"
AND b.name = "McGonagall Warehouse"
CREATE (a)-[:ROUTE{distance: point.distance(a.point, b.point)}]->(b);


MATCH (a:DistributionPoint), (b:DistributionPoint)
WHERE a.name = "George Warehouse"
AND b.name = "Molly Warehouse"
CREATE (a)-[:ROUTE{distance: point.distance(a.point, b.point)}]->(b);



// MATCH (f)
// WHERE labels(f) = ["Factory"] OR labels(f) = ["Customer"] 
// WITH f 
// MATCH (d:DistributionPoint)
// WITH f, d, point.distance(f.point, d.point) as distance
// ORDER BY distance
// WITH f, collect([d, distance]) as coll
// WITH f, coll[0] as closest
// RETURN f.name,closest[0].name, closest[1];

MATCH (f:Customer)
WHERE f.name ='Wellness Pharmacy Esbjerg'
SET f.latitude = 55.476474,
f.longitude = 8.431770,
f.point = point({latitude: 55.476474, longitude: 8.431770});

MATCH (f:Customer)
WHERE f.name ='CarePlus Kolding'
SET f.latitude = 55.519374,
f.longitude = 9.472985,
f.point = point({latitude: 55.519374, longitude: 9.472985});

MATCH (f:Customer)
WHERE f.name ='HealthHub Randers'
SET f.latitude = 56.450832,
f.longitude = 10.099521,
f.point = point({latitude: 56.450832, longitude: 10.099521});

MATCH (f:Customer)
WHERE f.name ='MediCare Aalborg'
SET f.latitude = 57.006733,
f.longitude =  10.115147,
f.point = point({latitude: 57.006733, longitude:  10.115147});

MATCH (f:Customer)
WHERE f.name ='City Pharma Aarhus'
SET f.latitude = 56.182631,
f.longitude =  10.377837,
f.point = point({latitude: 56.182631, longitude:  10.377837});

MATCH (f:Customer)
WHERE f.name ='LifePharma Horsens'
SET f.latitude = 55.853863,
f.longitude = 9.767215,
f.point = point({latitude: 55.853863, longitude: 9.767215});



MATCH (f)
WHERE labels(f) = ["Factory"] OR labels(f) = ["Customer"] 
WITH f 
MATCH (d:DistributionPoint)
WITH f, d, point.distance(f.point, d.point) as distance
ORDER BY distance
WITH f, collect([d, distance]) as coll
WITH f, coll[0][0] as closest, coll[0][1] as dist
CREATE (f)-[:ROUTE{distance: dist}]->(closest);


MATCH (f:Factory{name:"Rordisk Factory West"})-[r:ROUTE]->()
DELETE r;

MATCH (f:Factory{name:"Rordisk Factory West"})
MATCH (d:DistributionPoint{name:"Arthur Warehouse"})
CREATE (f)-[:ROUTE{distance:point.distance(f.point, d.point)}]->(d);




MATCH ()-[r:ROUTE_TO]->()
DELETE r;

MATCH (a)-[r:ROUTE]->(b)
CREATE (b)-[:ROUTE{distance:r.distance}]->(a);

MATCH (o:Order)
REMOVE o.productName;