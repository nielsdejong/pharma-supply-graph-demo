MATCH (f:Factory)--(p:Product)--(n:Order)--(c:Customer)
WITH p,n,c, collect(f) as factories
WITH p, n, c, apoc.coll.shuffle(factories)[0] as f

CALL apoc.algo.dijkstra(f, c, 'ROUTE', 'distance') YIELD path
WITH n,c,f,nodes(path) as nodes
UNWIND range(0,size(nodes)-1) as index
WITH index, n,c,f, nodes[index] as loc, nodes[index+1] as locnext,
CASE index
  WHEN = 0 THEN "Produced"
  WHEN = size(nodes)-1 THEN "Delivered"
  ELSE "Shipped"
END AS result
WITH n, loc, result, datetime(n.date)+duration({hours:rand()+9+3*index}) as end, datetime(n.date)+duration({hours:rand()+9+3*(index-1)}) as start
CREATE (e:Event{type:result, start:start, end:end})
CREATE (n)-[:HAS_EVENT]->(e)
CREATE (e)-[:LOCATED_AT]->(loc);

MATCH (o:Order)--(e:Event)
WITH o, e ORDER BY o.id, e.start
WITH o, collect(e) as events
UNWIND range(0,size(events)-2) as index
WITH o, events[index] as e, events[index+1] as next
CREATE (e)-[:NEXT]->(next);;

MATCH ()-[d:DELIVERS_TO]->()
DELETE d;

MATCH p=(place1)-[:LOCATED_AT]-()-[:NEXT]->()-[:LOCATED_AT]-(place2) 
MERGE (place1)-[d:DELIVERS_TO]->(place2)
ON MATCH SET d.totalShipped = d.totalShipped+1
ON CREATE SET d.totalShipped = 1;

MATCH (place)<-[:LOCATED_AT]-(e:Event)
WITH place, COUNT(e) as events
SET place.totalEvents = events;