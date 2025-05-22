import * as core from "@actions/core";
import * as github from "@actions/github";
import * as fs from "node:fs";
import * as path from "node:path";
import * as yaml from "yaml";
import * as glob from "glob";

interface WorkflowDocument {
	[key: string]: unknown;
}

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
	try {
		const { owner, repo } = github.context.repo;
		core.info(`Running SHA enforcement check on ${owner}/${repo}...`);

		const workflowsPath =
			core.getInput("workflows-path") || ".github/workflows";
		const failOnViolation = core.getInput("fail-on-violation") !== "false";
		const excludeInput = core.getInput("exclude") || "";

		// Process exclude patterns - handle both multiline and comma-separated formats
		let excludePatterns: string[] = [];

		if (excludeInput.includes("\n")) {
			// Handle multiline format with comments
			excludePatterns = parseMultilineExcludePatterns(excludeInput);
		} else {
			// Handle traditional comma-separated format
			excludePatterns = excludeInput
				.split(",")
				.map((p) => p.trim())
				.filter((p) => p.length > 0);
		}

		if (excludePatterns.length > 0) {
			core.info(`Excluding patterns: ${excludePatterns.join(", ")}`);
		}

		const fullWorkflowsPath = path.join(process.cwd(), workflowsPath);
		core.info(`Scanning workflow files in: ${fullWorkflowsPath}`);

		const workflowFiles = glob.sync(`${fullWorkflowsPath}/**/*.{yml,yaml}`);

		if (workflowFiles.length === 0) {
			core.warning(`No workflow files found in ${fullWorkflowsPath}`);
			return;
		}

		core.info(`Found ${workflowFiles.length} workflow files`);

		let hasViolations = false;

		for (const file of workflowFiles) {
			core.info(`Checking ${file}`);

			const content = fs.readFileSync(file, "utf8");
			let workflow: WorkflowDocument;

			try {
				workflow = yaml.parse(content) as WorkflowDocument;
			} catch (error) {
				core.warning(
					`Failed to parse ${file}: ${error instanceof Error ? error.message : String(error)}`,
				);
				continue;
			}

			if (!workflow || typeof workflow !== "object") {
				core.warning(`Invalid workflow file: ${file}`);
				continue;
			}

			const violations = findNonSHAPinning(workflow, excludePatterns);

			if (violations.length > 0) {
				hasViolations = true;
				for (const violation of violations) {
					const message = `${path.relative(process.cwd(), file)}: Action '${violation}' is not pinned to a full SHA`;
					core.error(message);
				}
			}
		}

		if (hasViolations && failOnViolation) {
			core.setFailed(
				"One or more actions are not pinned to a full SHA. Please update your workflows.",
			);
		} else if (hasViolations) {
			core.warning("Violations found, but action configured not to fail.");
		} else {
			core.info("All actions are properly pinned to full SHAs. ✅");
		}
	} catch (error) {
		core.setFailed(
			`Action failed: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}

/**
 * Parses multiline exclude patterns, handling comments and empty lines
 * @param {string} input - Multiline string with patterns
 * @returns {string[]} - Array of exclude patterns
 */
export function parseMultilineExcludePatterns(input: string): string[] {
	return input
		.split("\n")
		.map((line) => {
			// Remove comments and trim whitespace
			const commentIndex = line.indexOf("#");
			let processedLine = line;
			if (commentIndex >= 0) {
				processedLine = line.substring(0, commentIndex);
			}
			return processedLine.trim();
		})
		.filter((line) => line.length > 0);
}

/**
 * Recursively checks a workflow object for non-SHA pinning violations.
 * @param {WorkflowDocument} workflow - The workflow object to check.
 * @param {string[]} excludePatterns - Patterns to exclude from the check.
 * @returns {string[]} - An array of violations found.
 */
export const findNonSHAPinning = (
	workflow: WorkflowDocument,
	excludePatterns: string[],
): string[] => {
	const violations: string[] = [];

	function traverseAndCheck(obj: unknown, path: string[] = []) {
		if (!obj || typeof obj !== "object") return;

		if (Array.isArray(obj)) {
			obj.forEach((item, index) => {
				traverseAndCheck(item, [...path, index.toString()]);
			});
			return;
		}

		if ("uses" in obj && typeof obj.uses === "string") {
			const usesValue = obj.uses;

			if (excludePatterns.some((pattern) => usesValue.includes(pattern))) {
				return;
			}

			if (
				usesValue.startsWith("./") ||
				usesValue.startsWith("../") ||
				usesValue === "."
			) {
				return;
			}

			const shaRegex = /^[a-zA-Z0-9\-_/]+@[0-9a-f]{40}$/;
			if (!shaRegex.test(usesValue)) {
				violations.push(usesValue);
			}
		}

		for (const key of Object.keys(obj)) {
			traverseAndCheck((obj as Record<string, unknown>)[key], [...path, key]);
		}
	}

	traverseAndCheck(workflow);
	return violations;
};
