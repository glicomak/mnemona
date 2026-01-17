import Module from "../components/Module";

function Dashboard() {
  const modules: Module[] = [
    {
      course: {
        id: "1",
        department: "CS",
        serial: 100,
        name: "Object-Oriented Programming",
        status: "active"
      },
      weeks: [
        {
          id: "1",
          serial: 1,
          text: "Pillars of OOP",
          date: null,
          isComplete: false,
          targets: [
            {
              id: "1",
              serial: 1,
              text: "Abstraction",
              source: "TBA",
              isComplete: false
            },
            {
              id: "2",
              serial: 2,
              text: "Encapsulation",
              source: "TBA",
              isComplete: false
            },
            {
              id: "3",
              serial: 3,
              text: "Inheritance",
              source: "TBA",
              isComplete: false
            },
            {
              id: "4",
              serial: 4,
              text: "Polymorphism",
              source: "TBA",
              isComplete: false
            }
          ]
        },
        {
          id: "2",
          serial: 2,
          text: "OOP in Java",
          date: null,
          isComplete: false,
          targets: [
            {
              id: "5",
              serial: 1,
              text: "Classes",
              source: "TBA",
              isComplete: false
            },
            {
              id: "6",
              serial: 2,
              text: "Interfaces",
              source: "TBA",
              isComplete: false
            }
          ]
        }
      ]
    },
    {
      course: {
        id: "2",
        department: "CS",
        serial: 101,
        name: "Discrete Structures",
        status: "active"
      },
      weeks: [
        {
          id: "3",
          serial: 5,
          text: "Graphs and Trees",
          date: null,
          isComplete: false,
          targets: [
            {
              id: "7",
              serial: 1,
              text: "BFS and DFS",
              source: "TBA",
              isComplete: false
            },
            {
              id: "8",
              serial: 2,
              text: "Dijkstra's Algorithm",
              source: "TBA",
              isComplete: false
            }
          ]
        }
      ]
    }
  ]

  return (
    <div>
      <h1 className="text-xl my-4">Dashboard</h1>
      {modules.map((module) => (
        <Module key={module.course.id} module={module} />
      ))}
    </div>
  );
}

export default Dashboard;
