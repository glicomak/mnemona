import Module from "../components/Module";

function Dashboard() {
  const modules: Module[] = [
    {
      course: {
        id: "1",
        department: {
          id: "1",
          code: "CS",
          name: "Computer Science"
        },
        serial: 100,
        name: "Object-Oriented Programming"
      },
      weeks: [
        {
          id: "1",
          serial: 1,
          text: "Pillars of OOP",
          targets: [
            {
              id: "1",
              serial: 1,
              text: "Abstraction"
            },
            {
              id: "2",
              serial: 2,
              text: "Encapsulation"
            },
            {
              id: "3",
              serial: 3,
              text: "Inheritance"
            },
            {
              id: "4",
              serial: 4,
              text: "Polymorphism"
            }
          ]
        },
        {
          id: "2",
          serial: 2,
          text: "OOP in Java",
          targets: [
            {
              id: "5",
              serial: 1,
              text: "Classes"
            },
            {
              id: "6",
              serial: 2,
              text: "Interfaces"
            }
          ]
        }
      ]
    },
    {
      course: {
        id: "2",
        department: {
          id: "1",
          code: "CS",
          name: "Computer Science"
        },
        serial: 101,
        name: "Discrete Structures"
      },
      weeks: [
        {
          id: "3",
          serial: 5,
          text: "Graphs and Trees",
          targets: [
            {
              id: "7",
              serial: 1,
              text: "BFS and DFS"
            },
            {
              id: "8",
              serial: 2,
              text: "Dijkstra's Algorithm"
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
