import { Node, Edge } from "reactflow";
import rawHumanEvalProblems from "../utils/human_eval_problems.json";
import {
  Box,
  Text,
  Tag,
  TagLeftIcon,
  TagLabel,
  Textarea,
  List,
  ListItem,
  ListIcon,
  Input,
  Heading,
  Flex,
} from "@chakra-ui/react";
import { CheckIcon } from "@chakra-ui/icons";
import { MdCheck, MdQuestionMark, MdClose, MdThumbUpOffAlt } from "react-icons/md";
import { Settings, ToTNodeData, HumanEvalProblemsType } from "../utils/types";
import { Prompt } from "./Prompt";
import { getBranchesNodeParent } from "../utils/branchesNode";
import { useEffect, useState } from "react";
import { Markdown } from "./utils/Markdown";
import { Row } from "../utils/chakra";

const HUMAN_EVAL_PROBLEMS = rawHumanEvalProblems as HumanEvalProblemsType;

function EvalListItem({ item }: { item: string }) {
  if (item) {
    const lines = item.split("\n");
    const lastLine = lines[lines.length - 1];
    let icon = null;
    if (lastLine === "sure") {
      icon = <ListIcon as={MdCheck} color="green.500" />;
    } else if (lastLine === "impossible") {
      icon = <ListIcon as={MdClose} color="red.500" />;
    } else if (lastLine === "likely") {
      icon = <ListIcon as={MdQuestionMark} color="yellow.500" />;
    }

    return (
      <ListItem>
        {icon}
        {lines.map((line, i) => {
          return (
            <span key={i}>
              {line}
              <br />
            </span>
          );
        })}
      </ListItem>
    );
  }
  return <ListItem />;
}

export function NodeInfo({
  lineage,
  selectNode,
  submitPrompt,
  apiKey,
  onPromptType,
  nodes,
  edges,
}: {
  lineage: Node<ToTNodeData>[] | null;
  settings?: Settings;
  setSettings?: (settings: Settings) => void;
  isGPT4?: boolean;
  submitPrompt: () => Promise<void>;
  selectNode: (id: string) => void;
  apiKey: string | null;
  onPromptType: (text: string) => void;
  nodes: Node<ToTNodeData>[];
  edges: Edge[];
}) {
  const selectedNode =
    lineage &&
    (lineage.find((n) => n.selected === true) as Node<ToTNodeData> | undefined);
  const selectedNodeId = selectedNode?.id ?? null;
  const rootNode = lineage ? lineage[lineage.length - 1] : undefined;

  const [selectedNodeParent, setSelectedNodeParent] = useState<
    Node<ToTNodeData> | null | undefined
  >(null);

  useEffect(() => {
    const newSelectedNodeParent =
      selectedNodeId !== null ? getBranchesNodeParent(nodes, edges, selectedNodeId) : null;
    setSelectedNodeParent(newSelectedNodeParent);
  }, [selectedNodeId, nodes, edges]);

  return (
    <div className="node-info">
      {selectedNode?.data.isTerminal ? (
        <Tag
          size="lg"
          variant="subtle"
          colorScheme="purple"
          style={{ marginRight: "0.5rem" }}
        >
          <TagLeftIcon boxSize="12px" as={MdThumbUpOffAlt} />
          <TagLabel>Terminal</TagLabel>
        </Tag>
      ) : null}
      {selectedNode?.data.isValid ? (
        <Tag size="lg" variant="subtle" colorScheme="green">
          <TagLeftIcon boxSize="12px" as={CheckIcon} />
          <TagLabel>Valid</TagLabel>
        </Tag>
      ) : null}

      {/* <Heading as="h4" size="md">
        Input
      </Heading>
      {selectedNodeParent || selectedNodeId == null ? (
        <p>{selectedNode?.data.input ?? ""}</p>
      ) : (
        <Textarea
          defaultValue={selectedNode?.data.input ?? ""}
          onChange={(e) => {
            const newText = e.target.value;
            onPromptType(newText);
          }}
        />
      )} */}

      <Row
        mt={2}
        mb={2}
        p={3}
        mainAxisAlignment="flex-start"
        crossAxisAlignment="flex-start"
        borderRadius="6px"
        borderLeftWidth="0px" // {isLast ? "4px" : "0px"}
        _hover={{
          boxShadow: "0 0 0 0.5px #1a192b", // isLast ? "none" : "0 0 0 0.5px #1a192b",
        }}
        // borderColor={getBranchesNodeTypeDarkColor(data.branchesNodeType)}
        // position="relative"
        //onMouseEnter={() => setHoveredNodeId(node.id)}
        ///onMouseLeave={() => setHoveredNodeId(null)}
        bg={rootNode?.style?.background as string || "#f7d0a1"}
        // key={rootNode?.id}
        onClick={() => {
          const selection = window.getSelection();

          if (selection?.isCollapsed) {
            selectNode(rootNode!.id);
          }
        }}
        cursor="pointer"
      >
        <Box w="100%">
          <Heading as="h4" size="md">
            Starting Cube Position
          </Heading>

          {selectedNodeParent || selectedNodeId == null ? (
            <p>{selectedNode?.data.input ?? ""}</p>
          ) : (
            <Flex
              alignItems="center"
              border="1px solid"
              borderColor="gray.300"
              borderRadius="md"
              overflow="hidden"
              w="100%"
            >
              <Text
                backgroundColor="gray.100"
                padding="0.5rem"
                borderRight="1px solid"
                borderColor="gray.300"
              >
                Cube
              </Text>
              <Input
                type="number"
                placeholder="Enter number"
                defaultValue={selectedNode?.data.input.replace("Cube/", "")}
                onChange={(e) => {
                  const newText = "Cube/" + e.target.value;
                  onPromptType(newText);
                }}
                border="none"
                _focus={{ boxShadow: "none" }}
                w="100%"
                backgroundColor="white"
              />
            </Flex>
          )}

          {selectedNode?.data?.input &&
            HUMAN_EVAL_PROBLEMS[selectedNode?.data?.input] &&
            HUMAN_EVAL_PROBLEMS[selectedNode?.data?.input]["prompt"] && (
              <Box marginTop="1rem" w="100%">
                {" "}
                <Markdown
                  text={
                    "```\n" +
                    HUMAN_EVAL_PROBLEMS[selectedNode?.data?.input]["prompt"] +
                    "\n```"
                  }
                />
              </Box>
            )}
        </Box>
      </Row>

      {lineage && lineage.length >= 1 && (
        <Prompt
          selectedNode={selectedNode}
          submitPrompt={submitPrompt}
          key={selectedNode?.id}
          lineage={lineage}
          selectNode={selectNode}
        />
      )}
    </div>
  );
}
